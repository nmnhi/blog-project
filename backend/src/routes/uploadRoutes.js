import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  deleteMedia,
  uploadImage,
  uploadVideo,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), uploadImage);
router.post("/video", authMiddleware, upload.single("video"), uploadVideo);
router.delete("/", authMiddleware, deleteMedia);

export default router;
