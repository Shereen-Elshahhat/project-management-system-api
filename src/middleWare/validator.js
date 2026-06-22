import { AppError } from "../utils/AppError.js"

export const validator = (schema) => {
  return (req, res, next) => {
    let filter = { ...req.body, ...req.params, ...req.query };
    if (req.file) { filter.file = req.file }
    let { error } = schema.validate(filter, { abortEarly: false })
    if (error) {
      const messageError = error.details.map((err) => err.message).join(", ")
      next(new AppError(messageError, 400))
    } else {
      next()
    }
  }
} 