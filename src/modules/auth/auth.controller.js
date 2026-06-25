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
    res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: { name: data.name, email: data.email }
    })
})

const Login = catchError(async(req,res,next)=>{
    let isExist = await User.findOne({email:req.body.email}).select("+password")
    if (isExist && (await bcrypt.compare(req.body.password , isExist.password))) {
        if (isExist.status === "inactive") {
            return next(new AppError("your account is not active , please connect with admin", 403))
        }
        jwt.sign({id:isExist._id,name:isExist.name,role:isExist.role},process.env.JWT_SECRET,{ expiresIn: "7d" },(error,token)=>{
            if (error) return next(error)
            return res.status(200).json({
                status: "success",
                message: "success login with token",
                data: { token }
            });
        })
    } else {
        return next(new AppError("incorrect email or password", 404))
    }
})

const ProtectedRoute = catchError(async(req,res,next)=>{
    let {token} = req.headers
    if (!token) return next(new AppError("Please provide a token", 401))
    
    let payload = jwt.verify(token,process.env.JWT_SECRET)
    let user = await User.findById(payload.id)
    if(!user) return next(new AppError("User not found",404))
    req.user = user
    next()
})

const allowedTo = (...roles) => {
    return catchError(async(req,res,next)=>{
        if(roles.includes(req.user.role)) return next()
        return next(new AppError("you are not allowed to access this role",403))
    })
}

const forgetPassword = catchError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.isOTPVerified = false;
    await user.save();

    const subject = "Password Reset OTP - Project Management System";
    const html = otpEmailTemplate(user.name, otp);

    try {
        await sendEmail({ email, subject, html });
        res.status(200).json({
            status: "success",
            message: "OTP sent successfully to your email"
        });
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return next(new AppError("Failed to send OTP email. Please try again later.", 500));
    }
});

const verifyOTP = catchError(async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
        return next(new AppError("Invalid or expired OTP", 400));
    }

    user.isOTPVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "OTP verified successfully. You can now reset your password."
    });
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

    res.status(200).json({
        status: "success",
        message: "Password reset successfully"
    });
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