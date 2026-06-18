import { Router } from "express";
import { Login, Register, forgetPassword, verifyOTP, resetPassword, Logout } from "./auth.controller.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";
import { validator } from './../../middleWare/validator.js';
import { loginValidation, registerValidation, forgetPasswordValidation, verifyOTPValidation, resetPasswordValidation } from "./auth.validation.js";

const authRouter = Router()

authRouter.post("/register",validator(registerValidation),checkEmail,Register)
authRouter.post("/login",validator(loginValidation),Login)
authRouter.post("/logout", Logout)
authRouter.post("/forgetPassword", validator(forgetPasswordValidation), forgetPassword)
authRouter.post("/verifyOTP", validator(verifyOTPValidation), verifyOTP)
authRouter.post("/resetPassword", validator(resetPasswordValidation), resetPassword)


export {
    authRouter
}