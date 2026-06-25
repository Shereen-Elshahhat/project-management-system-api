import Joi, { objectId } from "../../utils/joi.js";

export const addUserValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{9,30}$/)
    .required(),
  rePassword: Joi.valid(Joi.ref("password")).required(),
  role: Joi.string().valid("user", "admin").default("user"),
  status: Joi.string().valid("active", "inactive").optional(),
});

export const updateUserSchema = Joi.object({
  id: objectId().required(),
  name: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().pattern(/^[A-Z][A-Za-z0-9]{8,30}$/).optional(),
  role: Joi.string().valid("user", "admin").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(2); // must have id and at least one other field to update

export const idSchema = Joi.object({
  id: objectId().required(),
});