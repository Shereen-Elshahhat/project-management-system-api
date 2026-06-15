import Joi from 'joi';

export const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),

    description: Joi.string().allow('').optional(),

    status: Joi.string()
        .valid('todo', 'inprogress', 'done')
        .optional(),

    project: Joi.string().hex().length(24).required(),

    assignedUser: Joi.string().hex().length(24).optional(),

    dueDate: Joi.date().optional(),
});

export const idSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

export const updateTaskSchema = Joi.object({
        title: Joi.string().trim().optional(),
        description: Joi.string().trim().optional(),
        assignedUser: Joi.string().hex().length(24).optional(),
        dueDate: Joi.date().optional(),
        status: Joi.string().valid("todo", "inprogress", "done").optional(),
    }).unknown(false);