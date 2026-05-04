import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { generateToken } from "../utils/jwt.js";
import User from "../models/User.js";

// Register a new user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }

  //   Create new user
  const user = await User.create({ name, email, password });

  //   Generate JWT token
  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
    message: "User registered successfully",
  });
});

// Login a user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }

  // Compare password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid email or password");
  }

  // Generate JƯT token
  const token = generateToken(user._id);

  return res.status(200).json({
    data: { user: user.toJSON(), token },
    success: true,
    message: "User logged in successfully",
  });
});

// Get current user
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
