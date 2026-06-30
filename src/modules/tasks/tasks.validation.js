import Joi from 'joi';

export const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),

    description: Joi.string().allow('').optional(),

    status: Joi.string()
        .valid('todo', 'inprogress', 'done')
        .optional(),

    project: Joi.string().hex().length(24).required(),

    assignedUser: Joi.string().hex().length(24).optional(),

    dueDate: Joi.date().min('now'),
});

export const idSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

export const updateTaskSchema = Joi.object({
        title: Joi.string().trim().min(3).max(30).optional(),
        description: Joi.string().trim().min(3).max(30).optional(),
        assignedUser: Joi.string().hex().length(24).optional(),
        dueDate: Joi.date().greater("now"),
        status: Joi.string().valid("todo", "inprogress", "done").optional(),
    }).unknown(false);