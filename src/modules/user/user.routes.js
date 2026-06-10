import { Router } from "express";
import { addUser, getUser, updateUser } from "./user.controller.js";
import { validator } from "../../middleWare/validator.js";
import { addUserValidation, getUserSchema, updateUserSchema } from "./user.validation.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";


const router = Router();

router.post("/add", checkEmail, validator(addUserValidation), addUser)
router.put("/update/:id", validator(updateUserSchema), updateUser)
router.get("/get/:id", validator(getUserSchema), getUser)

export {
    router as userRouter
}