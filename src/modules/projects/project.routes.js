import express from "express";
//import { ProtectedRoute, allowedTo } from "../auth/auth.controller.js";
import { getAllProjects, getProjectById } from "./project.controller.js";
import { validator } from "../../middleWare/validator.js";
import {
  getAllProjectssSchema,
  getProjectByIdSchema,
} from "./project.validation.js";
const projectRouter = express.Router();

projectRouter.use(ProtectedRoute);

projectRouter.get("/", validator(getAllProjectssSchema), getAllProjects);
projectRouter.get("/:id", validator(getProjectByIdSchema), getProjectById);

export default projectRouter;