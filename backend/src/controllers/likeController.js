import Like from "../models/Like.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// LIKE POST
export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    throw new ApiError(400, "postId is required");
  }

  await Like.create({
    user: req.user._id,
    post: postId,
  });

  res.status(201).json({
    success: true,
    message: "Post liked successfully",
  });
});

// UNLIKE POST
export const unlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    throw new ApiError(400, "postId is required");
  }

  await Like.findOneAndDelete({
    user: req.user._id,
    post: postId,
  });

  res.status(200).json({
    success: true,
    message: "Post unliked successfully",
  });
});

// GET TOTAL LIKES
export const getPostLikes = asyncHandler(async (req, res) => {
  const { postId } = req.params.postId;

  const count = await Like.countDocuments({ post: postId });

  res.json({ success: true, likes: count });
});

// CHEKC USER LIKE OR NOT
export const checkUserLiked = asyncHandler(async (req, res) => {
  const exists = await Like.findOne({
    user: req.user._id,
    post: req.params.postId,
  });

  res.json({ success: true, liked: Boolean(exists) });
});
