import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/change-password", authMiddleware, changePassword);
export default router;
