import Joi from 'joi';
// export
const createUserSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Invalid email format',
        }),

    password: Joi.string().min(6).required(),

    role: Joi.string().valid('user', 'admin').default('user'),
});
//export
const idSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.hex': 'Invalid MongoDB ID',
            'string.length': 'ID must be 24 characters'
        })
});

export{
    createUserSchema,idSchema,
}