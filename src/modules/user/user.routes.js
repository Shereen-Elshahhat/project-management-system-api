import express from 'express';

export const userRouter = express.Router();
import { validator as validate } from '../../middleWare/validator.js';
import { createUserSchema, idSchema } from './user.validation.js';
import {
    createUser,getAllUsers,deleteUser,getUserById
} from './user.controller.js';


userRouter.post('/',validate(createUserSchema,'body'), createUser);

userRouter.get('/', getAllUsers);

userRouter.get('/:id',validate(idSchema, 'params'), getUserById);

userRouter.delete('/:id',validate(idSchema, 'params'), deleteUser);