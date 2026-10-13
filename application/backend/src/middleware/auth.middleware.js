import {usermodel} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asynHandler.js"
import jwt from "jsonwebtoken"

// _ its for when we dont used res

const verfyJWT=asyncHandler(async(req, _,next)=>{
    try {
        
        const token=req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')
        // req.header for moblie users/app
        if(!token){
            throw new ApiError(404,"unAuthoriztion access")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user =await usermodel.findById(decodedToken?._id).select("-password -refreshToken")
        //select remove the fileds that we don't want 
        if(!user){
        throw new ApiError(401,"invaild access token")
       }
       req.user=user;
       next()

    } catch (error) {
         throw new ApiError(401,error?.message|| "inviald access!!!!!")        
    }

   

},)

export  {verfyJWT}
