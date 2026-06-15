import express from 'express';
import {createTask, getTaskById, getAllTasks, updateTask, deleteTask,} from './tasks.controller.js';
import { validator } from "../../middleWare/validator.js";
import { ProtectedRoute, allowedTo } from "../auth/auth.controller.js";
import {createTaskSchema, idSchema, updateTaskSchema} from './tasks.validation.js';


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
    getAllTasks
);

taskRouter.get('/:id', validator(idSchema), getTaskById);

taskRouter.put("/update/:id", ProtectedRoute, validator(updateTaskSchema), updateTask)
taskRouter.delete("/delete/:id", ProtectedRoute, validator(idSchema), deleteTask)