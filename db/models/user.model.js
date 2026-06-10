import mongoose from "../mongoose-global-setUp.js";
import { Schema } from "mongoose";


const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    status:{
        type: String,
        enum: ["Active", "InActive"],
        default: "InActive"
    },
    otp: String,
    otpExpireAt: Date,
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    changedPasswordAt: Date,
    resetPasswordExpireAt: Date
},
{
    versionKey: false,
    timestamps: true
});

UserSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpireAt;
        delete ret.isOtpVerified;
        delete ret.changedPasswordAt;
        delete ret.resetPasswordExpireAt;
        delete ret.role;
        return ret;
    }
});

const User = mongoose.model("User", UserSchema);
export default User;