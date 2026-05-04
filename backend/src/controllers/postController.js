import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Post from "../models/Post.js";
import {
  deleteMediaFromStorage,
  deleteMediaListFromStorage,
  normalizeMediaInput,
} from "../services/mediaService.js";

// Create Post
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, thumbnail, tags, media } = req.body;
  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const post = await Post.create({
    title,
    content,
    thumbnail: thumbnail ?? "",
    media: Array.isArray(media) ? media : [],
    tags: tags || [],
    author: req.user._id,
  });

  if (!post) {
    throw new ApiError(400, "Failed to create new post");
  }

  res.status(201).json({
    success: true,
    data: post,
    message: "Create new post successfully",
  });
});

// Get all posts pagiantion and search
export const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", sortBy = "desc" } = req.query;
  const query = search
    ? {
        $text: { $search: search },
      }
    : {};

  const posts = await Post.find(query)
    .populate("author", "name email avatar")
    .sort({ createdAt: sortBy == "desc" ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    data: posts,
    pagiantion: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET SINGLE POST
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name email avatar",
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// UPDATE POST (Only author)
export const updatePost = asyncHandler(async (req, res) => {
  const { title, content, thumbnail, tags, media, removedMedia = [] } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this post");
  }

  const nextThumbnail = thumbnail;
  const previousThumbnail = post.thumbnail;
  const isReplacingThumbnail =
    typeof nextThumbnail === "string" &&
    nextThumbnail &&
    nextThumbnail !== previousThumbnail;

  post.title = title || post.title;
  post.content = content || post.content;
  post.thumbnail = nextThumbnail ?? post.thumbnail;
  if (Array.isArray(media)) {
    post.media = media;
  }
  post.tags = tags || post.tags;

  await deleteMediaListFromStorage(removedMedia);
  if (Array.isArray(removedMedia) && removedMedia.length > 0) {
    const removedPublicIds = new Set(
      removedMedia
        .map((item) => normalizeMediaInput(item))
        .filter(Boolean)
        .map((item) => item.publicId),
    );

    if (removedPublicIds.size > 0) {
      post.media = (post.media || []).filter((item) => {
        const normalized = normalizeMediaInput(item);
        return !normalized || !removedPublicIds.has(normalized.publicId);
      });
    }
  }

  if (isReplacingThumbnail && previousThumbnail) {
    await deleteMediaFromStorage(previousThumbnail);
  }

  const updatedPost = await post.save();

  if (!updatedPost) {
    throw new ApiError(400, "Failed to update the post");
  }

  res.status(200).json({
    sucess: true,
    data: updatedPost,
    message: "Post updated successfully",
  });
});

// Delete post (Only author)
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to delete this post");
  }

  if (post.thumbnail) {
    await deleteMediaFromStorage(post.thumbnail);
  }
  await deleteMediaListFromStorage(post.media);
  await deleteMediaListFromStorage(req.body?.removedMedia);

  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});
