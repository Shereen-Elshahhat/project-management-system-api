import Joi from "joi";

export const getAllProjectssSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).optional().messages({
    "number.min": "Limit must be at least 1",
  }),
}).unknown(false);

export const getProjectByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).unknown(false);
