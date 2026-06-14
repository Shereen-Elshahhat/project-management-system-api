import { User } from "../../../db/models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { catchError } from "../../middleWare/catchError.js"
import { AppError } from "../../utils/AppError.js"
import { sendEmail } from "../../utils/sendEmail.js"
import { otpEmailTemplate } from "../../utils/emailTemplates.js"

const Register = catchError(async(req,res,next)=>{
        let data = new User(req.body)
        await data.save()
        res.status(201).json({message:"User created successfully",data:{name:data.name, email:data.email}})
})

const Login = catchError(async(req,res,next)=>{
        let isExist = await User.findOne({email:req.body.email}).select("+password")
        if(isExist && (await bcrypt.compare(req.body.password , isExist.password))){
            if(isExist.status === "No Active") return res.status(403).json({message:"your account is not active , please connect with admin"})
            jwt.sign({id:isExist._id,name:isExist.name,role:isExist.role},process.env.JWT_SECRET,{ expiresIn: "7d" },(error,token)=>{
                return res.status(200).json({message:"success login with token"  ,token});
            })
        }else{
            return res.status(404).json({message:"incorrect email or password"});
        }
})

// const ProtectedRoute = catchError(async(req,res,next)=>{
//     //check if token is exist
//     let {token} = req.headers
//
//     let payload= jwt.verify(token,process.env.JWT_SECRET)
//     let user = await User.findById(payload.id)
//     if(!user) return next(new AppError("User not found",404))
//     req.user = user
//     next()
// })

const ProtectedRoute = catchError(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError("Token missing", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(new AppError("Invalid token format", 401));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    req.user = user;

    next();
});
const allowedTo =(...roles)=>{
    return catchError(async(req,res,next)=>{

       if(roles.includes(req.user.role)) return next()
        return next(new AppError("you are not allowed to access this role",403))

})}




const forgetPassword = catchError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.optExpires = Date.now() + 10 * 60 * 1000;
    user.isOTPVerified = false;
    await user.save();

    const subject = "Password Reset OTP - Project Management System";
    const html = otpEmailTemplate(user.name, otp);

    try {
        await sendEmail({ email, subject, html });
        res.status(200).json({ message: "OTP sent successfully to your email" });
    } catch (error) {
        user.otp = undefined;
        user.optExpires = undefined;
        await user.save();
        return next(new AppError("Failed to send OTP email. Please try again later.", 500));
    }
});

const verifyOTP = catchError(async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    if (!user.otp || user.otp !== otp || user.optExpires < Date.now()) {
        return next(new AppError("Invalid or expired OTP", 400));
    }

    user.isOTPVerified = true;
    user.otp = undefined;
    user.optExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });
});

const resetPassword = catchError(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    if (!user.isOTPVerified) {
        return next(new AppError("Please verify your OTP first", 400));
    }

    user.password = password;
    user.isOTPVerified = false;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
});

export {
    Register,
    Login,
    ProtectedRoute,
    allowedTo,
    forgetPassword,
    verifyOTP,
    resetPassword
}