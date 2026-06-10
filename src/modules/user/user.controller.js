import { User } from '../../../db/models/user.model.js';
import {catchError} from '../../middleWare/catchError.js';
import {AppError} from '../../utils/AppError.js';

const createUser= catchError(async(req,res,next) => {

    const   {name,email,password,role}=req.body;
    if(req.body.role!=='user'&&req.body.role!=='admin'){
        // return res.status(403).json({ message: 'Invalid role' });
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
const getAllUsers =catchError(async(req,res,next) => {

    const users = await User.find();

    res.status(200).json(users);

})

const deleteUser =catchError(async(req,res,next) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {

        return next(new AppError("User not found",404));
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({message: "User deleted successfully"});
})

const getUserById =catchError(async(req,res,next) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {

        return next(new AppError("User not found",404));
    }

    res.status(200).json(user);

})
export{
    getUserById,createUser,getAllUsers,deleteUser,
}