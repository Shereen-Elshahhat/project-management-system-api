import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from "./user.controller.js";
import { validator } from "../../middleWare/validator.js";
import { addUserValidation, updateUserSchema, idSchema } from "./user.validation.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";
import { allowedTo, ProtectedRoute } from "../auth/auth.controller.js";


const router = Router();

router.post("/add", ProtectedRoute, allowedTo("admin"), checkEmail, validator(addUserValidation), createUser)
router.put("/update", ProtectedRoute, allowedTo("admin", "user"), validator(updateUserSchema), updateUser)
router.get("/get/:id", ProtectedRoute, allowedTo("admin"),validator(idSchema), getUser)
router.get("/", ProtectedRoute, allowedTo("admin"), getAllUsers)
router.delete('/:id', ProtectedRoute, allowedTo("admin"), validator(idSchema), deleteUser);

export {
    router as userRouter
}