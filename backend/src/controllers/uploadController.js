import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteMediaFromStorage } from "../services/mediaService.js";

// Helper: upload bufer into Cloudinary by stream
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

// UPLOAD IMAGE
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file upload");
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: "blog-project/images",
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  res.json({
    success: true,
    url: result.secure_url,
    public_id: result.public_id,
  });
});

// UPLOAD VIDEO (tối ưu + thumbnail)
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: "blog-project/videos",
    resource_type: "video",
    eager: [
      // tạo phiên bản tối ưu
      { width: 1280, height: 720, crop: "limit", quality: "auto" },
    ],
  });

  // Tạo thumbnail preview (frame từ video)
  const thumbnailUrl = cloudinary.url(result.public_id, {
    resource_type: "video",
    format: "jpg",
    width: 400,
    height: 225,
    crop: "fill",
  });

  res.json({
    success: true,
    url: result.secure_url,
    public_id: result.public_id,
    thumbnail: thumbnailUrl,
  });
});

// DELETE MEDIA (image or video)
export const deleteMedia = asyncHandler(async (req, res) => {
  const { publicId, type } = req.body;

  if (!publicId || !type) {
    throw new ApiError(400, "publicId and type are required");
  }

  await deleteMediaFromStorage({ publicId, type });

  res.json({
    success: true,
    message: "Media deleted successfully",
  });
});
