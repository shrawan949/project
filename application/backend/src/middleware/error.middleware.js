import { ApiError } from "../utils/apiError.js";

export  const  errorHandler=(err,req,res,next)=>{

    if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      data: err.data,
      error: err.error,
    //   stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
}
}