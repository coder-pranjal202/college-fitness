/**
 * Upload images to Cloudinary (100% Free — no credit card needed)
 * 
 * SETUP INSTRUCTIONS (2 minutes):
 * 
 * Step 1: Sign up at https://cloudinary.com (free, no credit card)
 * Step 2: From dashboard, copy your "Cloud name" (e.g., "dh8x9abc")
 * Step 3: Go to Settings → Upload → "Add upload preset"
 *         - Name: campus_arena
 *         - Type: Unsigned
 *         - Save
 * Step 4: Paste your cloud name below
 */

// ⚠️ CHANGE THIS to your Cloudinary cloud name
const CLOUD_NAME = "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = "campus_arena";

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - Secure URL of the uploaded image
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};

/**
 * Delete is optional — images can remain on Cloudinary free tier
 */
export const deleteImage = async () => {
  // Not needed — Cloudinary free tier has 25GB storage
};

/**
 * Compress and resize an image before upload
 */
export const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas to Blob failed"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Get a file extension from a file name
 */
export const getFileExtension = (fileName) => {
  return fileName.split(".").pop()?.toLowerCase() || "jpg";
};

/**
 * Generate a unique file name
 */
export const generateFileName = (prefix = "img") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
};