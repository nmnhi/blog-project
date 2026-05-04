import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { buildSwaggerSpec } from "./config/swagger.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API docs
const swaggerSpec = buildSwaggerSpec();
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/upload", uploadRoutes);

// Global Error Handler should bottom of all middleware
app.use(errorHandler);

export default app;
