import express from 'express';
import {createTask, getTaskById, getAllTasks,} from './tasks.controller.js';
import { validator } from "../../middleWare/validator.js";
import { ProtectedRoute, allowedTo } from "../auth/auth.controller.js";

import {createTaskSchema, idSchema} from './tasks.validation.js';
// import projectRouter from "../projects/project.routes.js";
export const taskRouter = express.Router();

taskRouter.post(
    '/',
    ProtectedRoute,
    allowedTo("admin"),
    validator(createTaskSchema),
    createTask
);
taskRouter.get(
    '/',
    ProtectedRoute,
    // allowedTo("admin"),
    getAllTasks
);

taskRouter.get('/:id', validator(idSchema), getTaskById);