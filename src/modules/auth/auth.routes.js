import { Router } from "express";
import { Login, Register } from "./auth.controller.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";
import { validator } from './../../middleWare/validator.js';
import { loginValidation, registerValidation } from "./auth.validation.js";

const authRouter = Router()

authRouter.post("/register",validator(registerValidation),checkEmail,Register)
authRouter.post("/login",validator(loginValidation),Login)


export {
    authRouter
}