import { User } from "../../db/models/user.model.js"

export const checkEmail = async(req,res,next)=>{

    let isExist = await User.findOne({email:req.body.email.toLowerCase()})
    if(isExist) return  res.status(409).json.message({message:"Email is exist"})
     next()
        
}