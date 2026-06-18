import express from "express";
import { ProtectedRoute, allowedTo } from "../auth/auth.controller.js";
import {
  addProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "./project.controller.js";
import { validator } from "../../middleWare/validator.js";
import {
  createProjectSchema,
  deleteProjectSchema,
  getAllProjectssSchema,
  getProjectByIdSchema,
  updateProjectSchema,
} from "./project.validation.js";
const projectRouter = express.Router();

projectRouter.use(ProtectedRoute);

projectRouter.post(
  "/",
  allowedTo("admin"),
  validator(createProjectSchema),
  addProject,
);
projectRouter.get("/", validator(getAllProjectssSchema), getAllProjects);
projectRouter.get("/:id", validator(getProjectByIdSchema), getProjectById);
projectRouter.put(
  "/:id",
  allowedTo("admin"),
  validator(updateProjectSchema),
  updateProject,
);
projectRouter.delete(
  "/:id",
  allowedTo("admin"),
  validator(deleteProjectSchema),
  deleteProject,
);

export default projectRouter;
