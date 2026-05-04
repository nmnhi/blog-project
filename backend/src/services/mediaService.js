import cloudinary from "../config/cloudinary.js";

export const parseCloudinaryUrl = (mediaUrl) => {
  try {
    const url = new URL(mediaUrl);
    const uploadMarker = "/upload/";
    const markerIndex = url.pathname.indexOf(uploadMarker);
    if (markerIndex === -1) return null;

    const resourceType = url.pathname.includes("/video/upload/")
      ? "video"
      : "image";

    const afterUpload = url.pathname.slice(markerIndex + uploadMarker.length);
    const segments = afterUpload.split("/").filter(Boolean);
    const publicIdSegments =
      segments[0] && /^v\d+$/.test(segments[0]) ? segments.slice(1) : segments;

    if (!publicIdSegments.length) return null;

    const fileName = publicIdSegments[publicIdSegments.length - 1];
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex > 0) {
      publicIdSegments[publicIdSegments.length - 1] = fileName.slice(0, dotIndex);
    }

    return {
      publicId: publicIdSegments.join("/"),
      resourceType,
    };
  } catch {
    return null;
  }
};

export const normalizeMediaInput = (media) => {
  if (!media) return null;

  if (typeof media === "string") {
    const parsed = parseCloudinaryUrl(media);
    if (parsed) return parsed;
    return {
      publicId: media,
      resourceType: "image",
    };
  }

  if (typeof media === "object") {
    const mediaUrl = media.url || media.secure_url;
    const parsedFromUrl = mediaUrl ? parseCloudinaryUrl(mediaUrl) : null;
    const publicId = media.publicId || media.public_id || parsedFromUrl?.publicId;
    if (!publicId) return null;

    const requestedType = media.type || media.resourceType || media.resource_type;
    return {
      publicId,
      resourceType:
        requestedType === "video" || parsedFromUrl?.resourceType === "video"
          ? "video"
          : "image",
    };
  }

  return null;
};

export const deleteMediaFromStorage = async (media) => {
  const normalized = normalizeMediaInput(media);
  if (!normalized) return;

  await cloudinary.uploader.destroy(normalized.publicId, {
    resource_type: normalized.resourceType,
  });
};

export const deleteMediaListFromStorage = async (mediaList = []) => {
  if (!Array.isArray(mediaList) || mediaList.length === 0) return;
  await Promise.all(mediaList.map((item) => deleteMediaFromStorage(item)));
};
