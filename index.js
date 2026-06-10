import { DBconnection } from './db/DBconnection.js'
import { bootstrap } from './bootstrap.js';
import express from 'express'


const app = express()
const port = 3005
bootstrap(app)
DBconnection()

app.get("/", (req,res)=>{
    return res.send("Hello Project 2")
})


app.listen(3005,()=>{
    console.log(`Server is running on port ${port}`)
})