import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Comment from "../models/Comment.js";

// CREATE POST
export const createComment = asyncHandler(async (req, res) => {
  const { content, postId, parentId } = req.body;

  if (!content || !postId) {
    throw new ApiError(400, "Content and postId are required");
  }

  const comment = await Comment.create({
    content,
    post: postId,
    user: req.user._id,
    parent: parentId || null,
  });

  if (!comment) {
    throw new ApiError(400, "Failed to add new comment");
  }
  res.status(200).json({
    success: true,
    data: comment,
    message: "Comment created successfully",
  });
});

// GET COMMENTS BY POST (with pagination)
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const comments = await Comment.find({
    post: req.params.postId,
    parent: null,
  })
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Comment.countDocuments({
    post: req.params.postId,
    parent: null,
  });

  res.status(200).json({
    success: true,
    data: comments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET REPLIES OF A COMMENT
export const getReplies = asyncHandler(async (req, res) => {
  const replies = await Comment.find({ parent: req.params.commentId })
    .populate("user", "name email avatar")
    .sort({ createdAt: 1 });

  if (!replies) {
    throw new ApiError(400, "Failed to get replies");
  }

  res.status(200).json({ success: true, data: replies });
});

// DELETE COMMENT (Only author)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You not have permission to delete this comment");
  }

  await comment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
