import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  getReplies,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", authMiddleware, createComment);
router.get("/post/:popostId", getCommentsByPost);
router.get("/replies/:commentId", getReplies);
router.delete("/:commeniId", authMiddleware, deleteComment);

export default router;
