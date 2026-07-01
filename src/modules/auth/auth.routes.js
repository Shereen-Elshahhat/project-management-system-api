import { Router } from "express";
import { Login, Register, forgetPassword, verifyOTP, resetPassword, verifyAccount, resendVerification, changePassword, logout, refreshToken } from "./auth.controller.js";
import { ProtectedRoute } from "../../middleWare/auth.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";
import { validator } from './../../middleWare/validator.js';
import { loginValidation, registerValidation, forgetPasswordValidation, verifyOTPValidation, resetPasswordValidation, verifyAccountValidation, resendVerificationValidation, changePasswordValidation, refreshTokenValidation } from "./auth.validation.js";

const authRouter = Router()

authRouter.post("/register",validator(registerValidation),checkEmail,Register)
authRouter.post("/login",validator(loginValidation),Login)
authRouter.post("/forgetPassword", validator(forgetPasswordValidation), forgetPassword)
authRouter.post("/verifyOTP", validator(verifyOTPValidation), verifyOTP)
authRouter.post("/resetPassword", validator(resetPasswordValidation), resetPassword)

authRouter.post("/verify-account", validator(verifyAccountValidation), verifyAccount)
authRouter.post("/resend-verification", validator(resendVerificationValidation), resendVerification)
authRouter.post("/change-password", ProtectedRoute, validator(changePasswordValidation), changePassword)
authRouter.post("/logout", ProtectedRoute, logout)
authRouter.post("/refresh-token", validator(refreshTokenValidation), refreshToken)

export {
    authRouter
}