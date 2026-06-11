import mongoose from "mongoose";

export const DBconnection = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project-management")
        console.log("db connected successfully")

    } catch (error) {
        console.log("Database connection failed :",error);
        
    }
}
