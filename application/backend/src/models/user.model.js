import { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowerCase: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowerCase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required !!!!']
    },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if(!this.isModified("password"))  return next() //used by  ismodifed to check password in change 
     this.password = await bcrypt.hash(this.password,10) 
      next()
})
userSchema.methods.isPasswordMatch= async function (password) {
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET
        ,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function (){
    return jwt.sign (
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET
        ,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY }
    )
}


export const usermodel = mongoose.model('User', userSchema)// users