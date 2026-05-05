import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteMediaFromStorage } from "../services/mediaService.js";
import Post from "../models/Post.js";

// GET CURRENT USER PROFILE
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// UPDATE USER PROFILE
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Remove old avatar out of the Cloudinary
  if (avatar && avatar !== user.avatar) {
    await deleteMediaFromStorage(user.avatar);
    user.avatar = avatar;
  }

  if (name) user.name = name;

  const updatedProfile = user.save();

  if (!updatedProfile) {
    throw new ApiError(400, "Failed to update profile");
  }

  res.status(200).json({
    success: true,
    data: updatedProfile,
    message: "Profile updated successfully",
  });
});

// CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new password are required");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMath = await user.comparePassword(oldPassword);
  if (!isMath) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// GET PUBLIC PROFILE BY USERID
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: user.toJSON(),
  });
});

// GET POST OF USER
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ auth: req.params.id }).sort({ cratedAt: -1 });

  res.status(200).json({
    success: true,
    data: posts,
  });
});
