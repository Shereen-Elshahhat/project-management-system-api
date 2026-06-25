import { User } from "../../../db/models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { catchError } from "../../middleWare/catchError.js"
import { AppError } from "../../utils/AppError.js"
import { sendEmail } from "../../utils/sendEmail.js"

const Register = catchError(async(req,res,next)=>{
        let data = new User(req.body)
        await data.save()
        res.status(201).json({message:"User created successfully",data:{name:data.name, email:data.email}})
})

const Login = catchError(async(req,res,next)=>{
        let isExist = await User.findOne({email:req.body.email}).select("+password")
        if(isExist && (await bcrypt.compare(req.body.password , isExist.password))){
            if(isExist.status === "No Active") return res.status(403).json({message:"your account is not active , please connect with admin"})
            jwt.sign({id:isExist._id,name:isExist.name,role:isExist.role},process.env.JWT_SECRET,{ expiresIn: "7d" },
        (error,token)=>{

        if (error) {
            console.log(error);
            return next(error);
                    }
        return res.status(200).json({message:"success login with token"  , token });
            })
        }else{
            return res.status(404).json({message:"incorrect email or password"});
        }
})

const ProtectedRoute = catchError(async(req,res,next)=>{
    //check if token is exist
    let {token} = req.headers
   
    let payload= jwt.verify(token,process.env.JWT_SECRET)
    let user = await User.findById(payload.id)
    if(!user) return next(new AppError("User not found",404))
    req.user = user
    next()
})
 

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
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.isOTPVerified = false;
    await user.save();

    const subject = "Password Reset OTP - Project Management System";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #555555;">Hello ${user.name},</p>
            <p style="font-size: 16px; color: #555555;">You requested to reset your password. Please use the following One-Time Password (OTP) to proceed. This OTP is valid for 10 minutes:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #1e88e5; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; border: 1px dashed #1e88e5;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888888; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
    `;

    try {
        await sendEmail({ email, subject, html });
        res.status(200).json({ message: "OTP sent successfully to your email" });
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