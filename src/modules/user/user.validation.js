import Joi from "joi";


export const addUserValidation = Joi.object({
        name:Joi.string().min(3).max(30).required(),
        email:Joi.string().email().required(),
        password:Joi.string().pattern(/^[A-Z][A-Za-z0-9]{8,30}$/).required(),
        rePassword:Joi.valid(Joi.ref("password")).required(),
        role:Joi.string().valid("user","admin").default("user")
    });

export const updateUserSchema = Joi.object({
        id: Joi.string().length(24).hex().required(),
        name:Joi.string().min(3).max(30),
        email:Joi.string().email(),
        password:Joi.string().pattern(/^[A-Z][A-Za-z0-9]{8,30}$/),
        role:Joi.string().valid("user","admin").default("user"),
        status:Joi.string().valid("active", "No Active")
    });

export const idSchema = Joi.object({
        id: Joi.string().length(24).hex().required(),
    });

export const getAllUsersSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sort: Joi.string().optional(),
    search: Joi.string().optional().trim(),
    name: Joi.string().optional().trim(),
    email: Joi.string().optional().trim(),
    role: Joi.string().valid("user", "admin").optional(),
    status: Joi.string().valid("active", "No Active").optional(),
}).unknown(false);

Joi.defaults(schema => schema.messages({
    "string.empty": "Field is required",
    "string.min": "Field must be at least {#limit} characters long",
    "string.max": "Field must be at most {#limit} characters long",
    "string.pattern.base": "Password must be at least 9 characters long and start with an uppercase letter",
    "any.required": "Field is required",
}));