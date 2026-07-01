import jwt from "jsonwebtoken";
import { User } from "../../db/models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { catchError } from "./catchError.js";

const ProtectedRoute = catchError(async(req,res,next)=>{
    let {token} = req.headers
    if (!token) return next(new AppError("Please provide a token", 401))
    
    try {
        let payload = jwt.verify(token,process.env.JWT_SECRET)
        let user = await User.findById(payload.id)
        if(!user) return next(new AppError("User not found",404))
        req.user = user
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('token expired', 401))
        }
        return next(new AppError('invalid token', 401))
    }
})

const allowedTo = (...roles) => {
    return catchError(async(req,res,next)=>{
        if(roles.includes(req.user.role)) return next()
        return next(new AppError("you are not allowed to access this role",403))
    })
}

export { ProtectedRoute, allowedTo };
