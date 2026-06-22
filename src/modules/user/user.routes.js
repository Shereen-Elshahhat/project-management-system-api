import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from "./user.controller.js";
import { validator } from "../../middleWare/validator.js";
import { addUserValidation, updateUserSchema, idSchema, getAllUsersSchema } from "./user.validation.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";


const router = Router();

router.post("/add", checkEmail, validator(addUserValidation), createUser)
router.put("/update/:id", validator(updateUserSchema), updateUser)
router.get("/get/:id", validator(idSchema), getUser)
router.get("/", validator(getAllUsersSchema), getAllUsers)
router.delete('/:id', validator(idSchema), deleteUser);

export {
    router as userRouter
}