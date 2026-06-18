import { User } from "../../../db/models/user.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";

// =============================================== add user by admin ===========================================
const createUser= catchError(async(req,res,next) => {
    const   {name,email,password,role}=req.body;
    if(req.body.role!=='user'&&req.body.role!=='admin'){
        return next(new AppError("Invalid role ",403))
    }
    else {
        const existing= await User.findOne({ email });
        if(existing){
            return res.status(403).json({ message: 'E-mail already exists' });
        }
        else{
            const newuser = await User.create({
                name,
                email,
                password,
                role,
            });
            return res.status(201).json({ message: 'User created', newuser });
        }
    }
})

// ===================================================== update user ===========================================
const updateUser = catchError(async(req,res,next)=>{
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
const getUser = catchError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user) return next(new AppError("User not found",404))
    res.status(201).json({message:"Done",user});
});

// ===================================================== get all users ===========================================
const getAllUsers =catchError(async(req,res,next) => {
    const users = await User.find();
    if (!users) {
        return next(new AppError("something went wrong",404));
    }
    res.status(200).json(users);
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

const getProfile = catchError(async (req, res, next) => {
    res.status(200).json({ message: "Done", user: req.user });
});

export{
    getUser,createUser,getAllUsers,deleteUser,updateUser,getProfile
}