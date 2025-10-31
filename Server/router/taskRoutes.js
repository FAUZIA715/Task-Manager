import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controller/taskController.js";
import { verifyToken } from "../middleware/authmiddleware.js";
const router = express.Router();
router.use(verifyToken);
router.get("/:userId", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
