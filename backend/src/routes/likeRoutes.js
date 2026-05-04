import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  checkUserLiked,
  getPostLikes,
  likePost,
  unlikePost,
} from "../controllers/likeController.js";

const router = express.Router();

router.post("/like", authMiddleware, likePost);
router.post("/unlike", authMiddleware, unlikePost);
router.get("/count/:postId", getPostLikes);
router.get("/check/:postId", checkUserLiked);

export default router;
