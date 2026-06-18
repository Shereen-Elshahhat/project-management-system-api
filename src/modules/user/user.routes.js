import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUser, updateUser, getProfile } from "./user.controller.js";
import { validator } from "../../middleWare/validator.js";
import { addUserValidation, updateUserSchema, idSchema } from "./user.validation.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";
import { ProtectedRoute } from "../auth/auth.controller.js";


const router = Router();

router.post("/add", checkEmail, validator(addUserValidation), createUser)
router.put("/update/:id", validator(updateUserSchema), updateUser)
router.get("/profile", ProtectedRoute, getProfile)
router.get("/get/:id", validator(idSchema), getUser)
router.get("/", getAllUsers)
router.delete('/:id', validator(idSchema), deleteUser);

export {
    router as userRouter
}