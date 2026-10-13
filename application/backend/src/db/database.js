import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function ConnectionDb() {
    try {
        await mongoose.connect(`${process.env.MONOGO_URL}/${DB_NAME}`)
        console.log('Connect database succesfully')        
    } catch (error) {
        console.log('mongoose not connect to db','error:',error)
    }   
}

export default ConnectionDb