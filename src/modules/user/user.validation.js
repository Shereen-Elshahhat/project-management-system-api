import Joi, { objectId } from "../../utils/joi.js";

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
  id: objectId().required(),
});