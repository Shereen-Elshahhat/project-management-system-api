export const globalError = (err,req,res,next)=>{
    let code = err.statusCode ||500 ;
    if (process.env.NODE_ENV === "development") console.error(err.stack);
    res.status(code).json({error:"error",message:err.message,code,stack:err.stack})
}