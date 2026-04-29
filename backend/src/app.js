import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Global Error Handler should bottom of all middleware
app.use(errorHandler);

export default app;
