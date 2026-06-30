import { User } from "../../db/models/user.model.js"
import { AppError } from "../utils/AppError.js"

export const checkEmail = async (req, res, next) => {
  if (!req.body.email) return next();
  let isExist = await User.findOne({ email: req.body.email.toLowerCase() })
  if (isExist) return next(new AppError("Email already exists", 409))
  next()
}