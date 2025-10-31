import express from "express";
import {
  getTasks,
  getStarredTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteTasksByList,
} from "../controller/taskController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.get("/starred", authMiddleware, getStarredTasks);
router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.delete("/list/:listName", authMiddleware, deleteTasksByList);

export default router;
