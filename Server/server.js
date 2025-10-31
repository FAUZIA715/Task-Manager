import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import taskRoutes from "./router/taskRoutes.js";
import authRoutes from "./router/authRoutes.js";
// Load env
dotenv.config();

// Connect to DB
connectDB();
// Initialize app
const app = express();
app.use(cors());
app.use(express.json());
//health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});
// Auth routes
app.use("/api/auth", authRoutes);
// Task route
app.use("/api/tasks", taskRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
