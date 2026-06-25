import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from "./user.controller.js";
import { validator } from "../../middleWare/validator.js";
import { addUserValidation, updateUserSchema, idSchema } from "./user.validation.js";
import { checkEmail } from "../../middleWare/checkEmailExist.js";
import { ProtectedRoute, allowedTo } from "../auth/auth.controller.js";

const router = Router();

router.use(ProtectedRoute);

router.post("/add", allowedTo("admin"), checkEmail, validator(addUserValidation), createUser);
router.put("/update/:id", validator(updateUserSchema), updateUser);
router.get("/get/:id", validator(idSchema), getUser);
router.get("/", allowedTo("admin"), getAllUsers);
router.delete("/:id", allowedTo("admin"), validator(idSchema), deleteUser);

export {
    router as userRouter
}