import Joi from "joi";

export const getAllProjectsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).optional().messages({
    "number.min": "Limit must be at least 1",
  }),
  sort: Joi.string().optional(),
  search: Joi.string().optional().trim(),
  // allowed filters
  title: Joi.string().optional().trim(),
  description: Joi.string().optional().trim(),
}).unknown(false);

export const getProjectByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).unknown(false);

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),

  description: Joi.string().trim().allow("").optional(),

  admin: Joi.string().hex().length(24).required().messages({
    "string.length": "Admin ID must be a valid ObjectId",
  }),

  team: Joi.array().items(Joi.string().hex().length(24)).optional(),
}).unknown(false);

export const updateProjectSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "any.required": "Project ID is required",
  }),
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().allow("").optional(),
  team: Joi.array().items(Joi.string().hex().length(24)).optional(),
})
  .min(1)
  .unknown(false);

export const deleteProjectSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "any.required": "Project ID is required",
  }),
}).unknown(false);
