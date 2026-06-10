import { User } from "../../../db/models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { catchError } from "../../middleWare/catchError.js"

const Register = catchError(async(req,res,next)=>{
        let data = new User(req.body)
        await data.save()
        res.status(201).json({message:"User created successfully",data:{name:data.name, email:data.email}})
})

const Login = catchError(async(req,res,next)=>{
        let isExist = await User.findOne({email:req.body.email}).select("+password")
        if(isExist && (await bcrypt.compare(req.body.password , isExist.password))){
            if(isExist.status === "No Active") return res.status(403).json({message:"your account is not active , please connect with admin"})
            jwt.sign({id:isExist._id,name:isExist.name,role:isExist.role},process.env.JWT_SECRET,{ expiresIn: "7d" },(error,token)=>{
                return res.status(200).json({message:"success login with token"  ,token});
            })
        }else{
            return res.status(404).json({message:"incorrect email or password"});
        }
})

const ProtectedRoute = catchError(async(req,res,next)=>{
    //check if token is exist
    let {token} = req.headers
   
    let payload= jwt.verify(token,process.env.JWT_SECRET)
    let user = await User.findById(payload.id)
    if(!user) return next(new AppError("User not found",404))
        req.user = user
        if(user.passwordChangeAt){
            const changePasswordTime = parseInt(user.passwordChangeAt.getTime()/1000,10)
            if(payload.iat < changePasswordTime) return next (new AppError("token expired"))
        }
    next()
})
 

const allowedTo =(...roles)=>{
    return catchError(async(req,res,next)=>{
       if(roles.includes(req.user.role)) return next()
        return next(new AppError("you are not allowed to access this role",403))

})}




export{
    Register,
    Login,
    ProtectedRoute,
    allowedTo
}