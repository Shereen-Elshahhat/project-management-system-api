export const catchError =(fun)=>{
     return(req,res,next)=>{
       return fun(req,res,next).catch((error)=>
         next(error)
        )
     }
}