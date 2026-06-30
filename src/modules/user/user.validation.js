import Joi from "joi";


export const addUserValidation = Joi.object({
        name:Joi.string().min(3).max(30).required(),
        email:Joi.string().email().required(),
        password:Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{9,30}$/).required(),
        rePassword:Joi.valid(Joi.ref("password")).required(),
        role:Joi.string().valid("user","admin").default("user").required(),
        status:Joi.string().valid("active","inactive")
    });

export const updateUserSchema = Joi.object({
        name:Joi.string().min(3).max(30),
        email:Joi.string().email(),
        password:Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{9,30}$/),
        role:Joi.string().valid("user","admin"),
        status:Joi.string().valid("active","inactive")
    });

export const idSchema = Joi.object({
        id: Joi.string().length(24).hex().required(),
    });



Joi.defaults(schema => schema.messages({
    "string.empty": "Field is required",
    "string.min": "Field must be at least {#limit} characters long",
    "string.max": "Field must be at most {#limit} characters long",
    "string.pattern.base": "Password must be at least 9 characters long and start with an uppercase letter",
    "any.required": "Field is required",
}));