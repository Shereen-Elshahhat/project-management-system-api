import { User } from "../../../db/models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { catchError } from "../../middleWare/catchError.js"
import { AppError } from "../../utils/AppError.js"
import { sendEmail } from "../../utils/sendEmail.js"
import { otpEmailTemplate, verificationEmailTemplate } from "../../utils/emailTemplates.js"
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js"


const Register = catchError(async(req,res,next)=>{
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    let data = new User({
        ...req.body,
        otp,
        otpExpires,
        status: "inactive"
    })

    console.log(`[Verification OTP for ${data.email}]: ${otp}`);

    const subject = "Account Verification OTP - Project Management System";
    const html = verificationEmailTemplate(data.name, otp);

    try {
        await sendEmail({ email: data.email, subject, html });
    } catch (error) {
        console.error("Verification email failed to send:", error);
        return next(new AppError("Failed to send verification email. Registration aborted.", 500));
    }

    await data.save()

    res.status(201).json({
        status: "success",
        message: "User created successfully. Please check your email for the verification code.",
        data: { name: data.name, email: data.email }
    })
})


const Login = catchError(async(req,res,next)=>{
    let isExist = await User.findOne({email:req.body.email}).select("+password")
    if (isExist && (await bcrypt.compare(req.body.password , isExist.password))) {
        if (isExist.status === "inactive") {
            return next(new AppError("your account is not active, please verify your account first", 403))
        }
        
        const accessToken = generateAccessToken(isExist);
        const refreshToken = generateRefreshToken(isExist);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        isExist.refreshTokens.push({ token: refreshToken, expiresAt });
        await isExist.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            status: "success",
            message: "success login with token",
            data: { 
                token: accessToken,
                refreshToken
            }
        });
    } else {
        return next(new AppError("incorrect email or password", 404))
    }
})



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

const verifyAccount = catchError(async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    if (user.status === "active") {
        return next(new AppError("Account is already verified and active", 400));
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
        return next(new AppError("Invalid or expired OTP", 400));
    }

    user.status = "active";
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Account verified and activated successfully. You can now login."
    });
});

const resendVerification = catchError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    if (user.status === "active") {
        return next(new AppError("Account is already verified and active", 400));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[Resent Verification OTP for ${user.email}]: ${otp}`);

    const subject = "Account Verification OTP - Project Management System";
    const html = verificationEmailTemplate(user.name, otp);

    try {
        await sendEmail({ email, subject, html });
        res.status(200).json({
            status: "success",
            message: "Verification OTP resent successfully to your email"
        });
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return next(new AppError("Failed to send verification OTP email. Please try again later.", 500));
    }
});

const changePassword = catchError(async (req, res, next) => {
    const { oldPassword, password } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return next(new AppError("User not found", 404));

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return next(new AppError("Incorrect current password", 400));

    user.password = password;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password changed successfully"
    });
});

const logout = catchError(async (req, res, next) => {
    let token = req.body.refreshToken;
    if (!token && req.headers.cookie) {
        const rawCookies = req.headers.cookie || "";
        const cookies = Object.fromEntries(rawCookies.split(";").map(c => c.trim().split("=")));
        token = cookies.refreshToken;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + "_refresh"));
            const user = await User.findById(decoded.id);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
                await user.save();
            }
        } catch (error) {
            // Ignore verification error on logout
        }
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
        status: "success",
        message: "Logged out successfully."
    });
});

const refreshToken = catchError(async (req, res, next) => {
    let token = req.body.refreshToken;
    if (!token && req.headers.cookie) {
        const rawCookies = req.headers.cookie || "";
        const cookies = Object.fromEntries(rawCookies.split(";").map(c => c.trim().split("=")));
        token = cookies.refreshToken;
    }

    if (!token) return next(new AppError("Refresh token is required", 400));

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + "_refresh"));
    } catch (error) {
        return next(new AppError("Invalid or expired refresh token", 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError("User not found", 404));

    const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === token);
    if (tokenIndex === -1) {
        return next(new AppError("Invalid refresh token", 401));
    }

    const tokenObj = user.refreshTokens[tokenIndex];
    if (tokenObj.expiresAt < Date.now()) {
        user.refreshTokens.splice(tokenIndex, 1);
        await user.save();
        return next(new AppError("Expired refresh token", 401));
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens[tokenIndex] = { token: newRefreshToken, expiresAt: newExpiresAt };
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: "success",
        message: "Token refreshed successfully",
        data: {
            token: newAccessToken,
            refreshToken: newRefreshToken
        }
    });
});

export {
    Register,
    Login,
    forgetPassword,
    verifyOTP,
    resetPassword,
    verifyAccount,
    resendVerification,
    changePassword,
    logout,
    refreshToken
}