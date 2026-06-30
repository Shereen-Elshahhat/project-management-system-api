import Joi from "joi";

const customJoi = Joi.defaults((schema) =>
  schema.messages({
    "string.empty": "Field is required",
    "string.min": "Field must be at least {#limit} characters long",
    "string.max": "Field must be at most {#limit} characters long",
    "string.pattern.base":
      "Password must be at least 9 characters long and start with an uppercase letter",
    "any.required": "Field is required",
  })
);

export const objectId = () => customJoi.string().hex().length(24);
export default customJoi;
