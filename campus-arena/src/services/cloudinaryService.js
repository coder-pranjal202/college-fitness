/**
 * Cloudinary image upload service
 *
 * Uploads images to Cloudinary using an unsigned upload preset.
 * Only the returned secure_url is stored — images are never stored locally.
 *
 * Requires these environment variables:
 *   VITE_CLOUDINARY_CLOUD_NAME  – from Cloudinary Dashboard
 *   VITE_CLOUDINARY_UPLOAD_PRESET – an unsigned upload preset
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Validate that Cloudinary environment variables are configured.
 * Throws an error if either is missing or blank.
 */
function validateConfig() {
  if (!CLOUD_NAME || CLOUD_NAME.trim() === "") {
    throw new Error(
      "Cloudinary Cloud Name is not configured. " +
      "Set VITE_CLOUDINARY_CLOUD_NAME in your .env file."
    );
  }
  if (!UPLOAD_PRESET || UPLOAD_PRESET.trim() === "") {
    throw new Error(
      "Cloudinary Upload Preset is not configured. " +
      "Set VITE_CLOUDINARY_UPLOAD_PRESET in your .env file."
    );
  }
}

/**
 * Validate file type and size before upload.
 *
 * @param {File} file
 * @param {object} [options]
 * @param {number} [options.maxSizeMB=5] – Maximum file size in MB
 * @param {string[]} [options.allowedTypes] – E.g. ["image/jpeg", "image/png", "image/webp"]
 */
export function validateFile(
  file,
  { maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] } = {}
) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const readable = allowedTypes.map((t) => t.split("/")[1]).join(", ");
    return {
      valid: false,
      error: `Unsupported file type. Allowed: ${readable}.`,
    };
  }

  // Check file size (maxSizeMB in MB)
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Crop an image from a URL/path using canvas, based on the crop area from react-easy-crop.
 *
 * @param {string} imageSrc – Source URL of the image to crop
 * @param {object} pixelCrop – { x, y, width, height } from react-easy-crop
 * @param {number} [outputWidth] – Desired output width (optional, defaults to crop width)
 * @param {number} [outputHeight] – Desired output height (optional, defaults to crop height)
 * @returns {Promise<Blob>} – Cropped image as a Blob
 */
export async function getCroppedImg(imageSrc, pixelCrop, outputWidth, outputHeight) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Smaller output = faster upload. 300px is sufficient for display on any screen.
  const w = Math.min(outputWidth || pixelCrop.width, 300);
  const h = Math.min(outputHeight || pixelCrop.height, 300);

  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    w,
    h
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to Blob failed"));
      },
      "image/jpeg",
      0.75
    );
  });
}

/**
 * Helper: load an image from a src string into an HTMLImageElement
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export async function uploadToCloudinary(
  file,
  { compress = true, maxWidth = 1200, quality = 0.8 } = {}
) {
  validateConfig();

  // Optional client-side compression for smaller uploads
  let fileToUpload = file;
  if (compress && file.type !== "image/gif") {
    try {
      const { compressImage } = await import("./storageService");
      const compressedBlob = await compressImage(file, maxWidth, quality);
      // Preserve original file type if possible
      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      fileToUpload = new File([compressedBlob], file.name, { type: mimeType });
    } catch {
      // Fall back to original file if compression fails
      console.warn("Image compression failed, uploading original file.");
    }
  }

  // Build FormData for the unsigned upload
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Cloudinary upload failed (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      message = errorData.error?.message || message;
    } catch {
      // Use the generic message
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.secure_url;
}