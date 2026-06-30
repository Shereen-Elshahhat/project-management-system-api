import Joi, { objectId } from "../../utils/joi.js";

export const getAllProjectsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).optional().messages({
    "number.min": "Limit must be at least 1",
  }),
  sort: Joi.string().optional(),
  fields: Joi.string().optional(),
  search: Joi.string().optional(),
  // allowed filters
  title: Joi.string().optional().trim(),
  description: Joi.string().optional().trim(),
}).unknown(false);

export const getProjectByIdSchema = Joi.object({
  id: objectId().required(),
}).unknown(false);

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),

  description: Joi.string().trim().allow("").optional(),

  team: Joi.array().items(objectId()).min(1).optional(),
}).unknown(false);

export const updateProjectSchema = Joi.object({
  id: objectId().required().messages({
    "any.required": "Project ID is required",
  }),
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().allow("").optional(),
  team: Joi.array().items(objectId()).min(1).optional(),
})
  .min(1)
  .unknown(false);

export const deleteProjectSchema = Joi.object({
  id: objectId().required().messages({
    "any.required": "Project ID is required",
  }),
}).unknown(false);
