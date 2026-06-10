//import { authRouter } from "./src/modules/auth/auth.routes.js"
import express from 'express'
import { AppError } from './src/utils/AppError.js';
import { globalError } from './src/middleWare/globalError.js';
import projectRouter from './src/modules/projects/project.routes.js';

export const bootstrap = (app)=>{
    app.use(express.json())
  //  app.use("/auth",authRouter)
    app.use("/projects",projectRouter)

    app.use((req,res,next)=>{
        next(new AppError(`404 not found page ${req.originalUrl}`,404))
    })
    
    app.use(globalError)
    process.on("unhandledRejection",(err)=>{
        console.log("error DB");
        
    })
    
}