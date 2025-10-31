const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
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
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
