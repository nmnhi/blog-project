import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

export default app;
