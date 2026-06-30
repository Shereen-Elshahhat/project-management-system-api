import { User } from "../../../db/models/user.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from 'bcrypt'

// =============================================== add user by admin ===========================================
const createUser= catchError(async(req,res,next) => {
    const   {name,email,password,role}=req.body;
    // create user
            const newuser = await User.create({
                name,
                email,
                password,
                role,
            });
            newuser.password = undefined;
            return res.status(201).json({ message: 'User created', data: newuser });
});

// ===================================================== update user ===========================================
const updateUser = catchError(async(req,res,next)=>{
    // find user
    const user = await User.findById(req.user.id);
    if(!user) return next(new AppError("User not found",404));
    // destruct data 
    if(req.body.name) user.name = req.body.name;
    if(req.body.email) {
        // check duplicate email
        const isEmailExict = await User.findOne({email:req.body.email});
        if(isEmailExict) return next(new AppError("Email is exist",409));
        user.email = req.body.email;
    };
    if(req.body.password) {
        user.password = req.body.password;
    };
    // only admin can update role and status
    if (req.user.role === "admin") {
        if (req.body.role) user.role = req.body.role;
        if (req.body.status) user.status = req.body.status;
    };
    // save updates
    await user.save();
    res.status(200).json({message:"Data updated successfully",data: user});
});

// ===================================================== get user by id ==========================================
const getUser = catchError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user) return next(new AppError("User not found",404))
    res.status(200).json({message:"Done",data: user});
});

// ===================================================== get all users ===========================================
const getAllUsers =catchError(async(req,res,next) => {
    const users = await User.find();
    if (users.length === 0) {
        return next(new AppError("something went wrong",404));
    }
    res.status(200).json({data: users});
})

// ===================================================== delete user ===========================================
const deleteUser =catchError(async(req,res,next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User not found",404));
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({message: "User deleted successfully"});
})

export{
    getUser,createUser,getAllUsers,deleteUser,updateUser
}