import mongoose from "mongoose";

// mongoose.connect("")
export const DBconnection = async()=>{
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/project-management")
        console.log("db connected successfully")

    } catch (error) {
        console.log("Database connection failed :",error);
        
    }
}