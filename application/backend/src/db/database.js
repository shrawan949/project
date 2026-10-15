import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function ConnectionDb() {
    try {
        const mongoUrl = process.env.MONGO_URI;

        if (!mongoUrl) {
            throw new Error("MONGO_URI is not set");
        }

        const connectionUrl = `${mongoUrl.replace(/\/+$/, "")}/${DB_NAME}`;

        await mongoose.connect(connectionUrl);
        console.log("Connected to database successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

export default ConnectionDb;
