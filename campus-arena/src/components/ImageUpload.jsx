import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { validateFile, uploadToCloudinary } from "../services/cloudinaryService";
import ImageCropModal from "./ImageCropModal";

export default function ImageUpload({
  currentImageUrl,
  onUploadComplete,
  accept = "image/*",
  maxSizeMB = 5,
  label = "Upload Image",
  aspect = 1,
  cropShape = "rect",
  cropTitle = "Crop Image",
}) {
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const selectedFileRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type and size using the shared validator
    const validation = validateFile(file, { maxSizeMB });
    if (!validation.valid) {
      setError(validation.error);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Store the file for later upload
    selectedFileRef.current = file;

    // Show local preview and open crop modal
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setRawImageUrl(localUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropModalOpen(false);
    setRawImageUrl(null);

    if (!croppedBlob) {
      // Crop failed — revert
      setError("Failed to crop image. Please try again.");
      setPreview(currentImageUrl || null);
      return;
    }

    // Convert blob to File for upload
    const originalName = selectedFileRef.current?.name || "cropped.jpg";
    const croppedFile = new File([croppedBlob], originalName, {
      type: "image/jpeg",
    });

    // Upload to Cloudinary
    setUploading(true);
    setProgress(10);

    try {
      setProgress(30);
      const secureUrl = await uploadToCloudinary(croppedFile, {
        compress: false, // already cropped, no need for extra compression
      });
      setProgress(100);

      // Pass back only the secure_url
      onUploadComplete(secureUrl);
      setPreview(secureUrl);
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      setError(err.message || "Failed to upload image. Please try again.");
      // Revert preview to original on failure
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
      setProgress(0);
      selectedFileRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setRawImageUrl(null);
    // Revert preview since user cancelled
    setPreview(currentImageUrl || null);
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    onUploadComplete(null);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-200">{label}</label>
      )}

      {/* Preview */}
      {preview ? (
        <div className="relative inline-block group">
          <div className={`overflow-hidden ${cropShape === "round" ? "rounded-full" : "rounded-2xl"} ring-1 ring-white/10 group-hover:ring-white/20 transition-all`}>
            <img
              src={preview}
              alt="Preview"
              className={`${
                cropShape === "round" 
                  ? "w-40 h-40 sm:w-48 sm:h-48" 
                  : "w-64 h-40 sm:w-80 sm:h-56 md:w-96 md:h-64"
              } object-cover transition-transform duration-300 group-hover:scale-105`}
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0-1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!uploading && (
              <button
                onClick={handleRemove}
                className="bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
                title="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
              <Loader2 size={28} className="text-green-400 animate-spin mb-2" />
              <span className="text-white text-xs font-semibold">{progress}%</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative ${
            cropShape === "round"
              ? "w-40 h-40 sm:w-48 sm:h-48"
              : "w-64 h-40 sm:w-80 sm:h-56 md:w-96 md:h-64"
          } border-2 border-dashed border-gray-600 hover:border-green-400/70 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-white/[0.03] hover:bg-white/[0.07] hover:shadow-lg hover:shadow-green-500/5 group ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="text-green-400 animate-spin mb-2" />
              <span className="text-gray-400 text-sm">Uploading... {progress}%</span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-green-500/10 transition-colors mb-2">
                <Upload size={28} className="text-gray-400 group-hover:text-green-400 transition-colors" />
              </div>
              <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Click to upload</span>
              <span className="text-gray-600 text-xs mt-1 group-hover:text-gray-500 transition-colors">Max {maxSizeMB}MB</span>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Crop Modal */}
      {cropModalOpen && rawImageUrl && (
        <ImageCropModal
          imageSrc={rawImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={aspect}
          cropShape={cropShape}
          title={cropTitle}
        />
      )}
    </div>
  );
}