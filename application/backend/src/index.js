import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import connectDB from "./db/database.js";
import authRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
import { setSocket } from "./controllers/note.controller.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.Cors || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

setSocket(io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        data: { msg: "Server is Active" },
        message: "Success"
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Backend startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
