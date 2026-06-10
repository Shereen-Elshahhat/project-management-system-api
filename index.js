// import { DBconnection } from './db/DBconnection.js'
import { bootstrap } from './bootstrap.js';
import express from 'express'
import { DBconnection } from './db/dbconnect.js';
import dotenv from "dotenv";


const app = express()
const port = 3005
bootstrap(app)
DBconnection()
dotenv.config();

app.get("/", (req,res)=>{
    return res.send("Hello Project 2")
})


app.listen(3005,()=>{
    console.log(`Server is running on port ${port}`)
})