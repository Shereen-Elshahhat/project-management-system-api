import { User } from "../../../db/models/user.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";

// =============================================== add user by admin ===========================================
export const addUser = catchError(async(req,res,next)=>{
    const {name,email,password, role} = req.body;
    const data = new User({
        name,
        email,
        password,
        role
    });
    await data.save()
    res.status(201).json({message:"User created successfully",data})
});

// ===================================================== update user ===========================================
export const updateUser = catchError(async(req,res,next)=>{
    // destructure
    const updatedData = {};
    if(req.body.name) updatedData.name = req.body.name;
    if(req.body.email) updatedData.email = req.body.email;
    if(req.body.password) updatedData.password = req.body.password;
    if(req.body.role) updatedData.role = req.body.role;
    if(req.body.status) updatedData.status = req.body.status;

    // update data
    const data = await User.findByIdAndUpdate(req.params.id,updatedData,{returnDocument:"after"});
    res.status(201).json({message:"Data updated successfully",data});
});

// ===================================================== get user by id ==========================================
export const getUser = catchError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user) return next(new AppError("User not found",404))
    res.status(201).json({message:"Done",user});
});