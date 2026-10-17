
import mongoose from "mongoose";

async function ConnectionDb() {
    try {
        const mongoUrl = process.env.MONGO_URI;

        if (!mongoUrl) {
            throw new Error("MONGO_URI is not set");
        }

        await mongoose.connect(mongoUrl);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

export default ConnectionDb;
