import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controller/taskController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
