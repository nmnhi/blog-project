import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  changePassword,
  getMe,
  getUserPosts,
  getUserProfile,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateProfile);
router.put("/me", authMiddleware, changePassword);
router.get("/:id", getUserProfile);
router.get("/:id/posts", getUserPosts);

export default router;
