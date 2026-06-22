import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Loader2, ZoomIn, ZoomOut, Check, X } from "lucide-react";
import { getCroppedImg } from "../services/cloudinaryService";

/**
 * Crop modal using react-easy-crop.
 * Opens as an overlay so the user can drag, zoom, and adjust the crop area before uploading.
 */
export default function ImageCropModal({
  imageSrc,
  onCropComplete,
  onCancel,
  aspect = 1,
  cropShape = "rect",
  title = "Crop Image",
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.2;

  const onCropChange = useCallback((location) => setCrop(location), []);
  const onZoomChange = useCallback((z) => setZoom(z), []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const onCropAreaComplete = useCallback((_percentages, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setCropping(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 400, 400);
      onCropComplete(croppedBlob);
    } catch (err) {
      console.error("Crop failed:", err);
      onCropComplete(null);
    } finally {
      setCropping(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setTimeout(onCancel, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "bg-black/70 backdrop-blur-sm" : "bg-black/0"
      }`}
    >
      <div
        className={`relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            disabled={cropping}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative w-full h-[400px] sm:h-[500px] bg-gray-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
          {/* Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-gray-400 text-xs px-3 py-1.5 rounded-full border border-white/5">
            Drag to reposition · Scroll to zoom
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-3 px-6 py-4 border-y border-white/5">
          <button
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:text-gray-700 disabled:cursor-not-allowed transition"
          >
            <ZoomOut size={18} />
          </button>
          <div className="relative flex-1 group">
            <input
              type="range"
              value={zoom}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-green-500 h-1.5 cursor-pointer appearance-none bg-white/10 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-green-500/30 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
            />
          </div>
          <button
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:text-gray-700 disabled:cursor-not-allowed transition"
          >
            <ZoomIn size={18} />
          </button>
          <span className="text-sm text-gray-400 font-mono min-w-[3rem] text-right tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={handleCancel}
            disabled={cropping}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={cropping || !croppedAreaPixels}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-600/20 transition-all hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {cropping ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Cropping...
              </>
            ) : (
              <>
                <Check size={18} />
                Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
