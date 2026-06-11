import dotenv from "dotenv";
dotenv.config();
import { bootstrap } from './bootstrap.js';
import express from 'express'
import { DBconnection } from './db/dbconnect.js';


const app = express()
const port = process.env.PORT || 3005
bootstrap(app)
DBconnection()


app.get("/", (req,res)=>{
    return res.send("Hello Project 2")
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})