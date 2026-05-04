import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Expires in 7 days
};

// Verify JWT token (use in middleware to authenticate user)
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
