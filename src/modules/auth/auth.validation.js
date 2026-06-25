import Joi from "../../utils/joi.js";

export const registerValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[A-Z][A-Za-z0-9]{8,30}$/).required(),
  rePassword: Joi.valid(Joi.ref("password")).required(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[A-Z][A-Za-z0-9]{8,30}$/).required(),
});

export const forgetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyOTPValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[A-Z][A-Za-z0-9]{8,30}$/).required(),
  rePassword: Joi.valid(Joi.ref("password")).required(),
});