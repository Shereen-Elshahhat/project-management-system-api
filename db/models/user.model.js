import { model, Schema } from "mongoose"
import bcrypt from 'bcrypt'

const userSchema = new Schema ({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        minlength:9,
        select:false,
    },
    role:{
        type:String,
        enum: ["user", "admin"],
        default: "user"
    },
    status: {
     type: String,
     enum: ["active", "No Active"],
     default: "No Active"
   },
   otp:{
    type:String,
   },
   optExpires:Date,
   isOTPVerified:{
     type:Boolean,
     default:false
   }
},{timestamps: true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,8)
    next()
})


export const User = model("user", userSchema)