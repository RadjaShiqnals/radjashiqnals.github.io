import React, { useState, useRef, useEffect, useCallback } from "react";
import { type WallpaperConfig } from "../../../lib/wallpaper-state";
import { saveWallpaperBlob } from "../../../lib/wallpaper-db";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Check,
  X,
  Sparkles,
  Smartphone,
  Monitor,
  Crop,
  Rotate3D,
} from "lucide-react";

interface WallpaperCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  config: WallpaperConfig;
  onApply: (updatedConfig: WallpaperConfig) => void;
}

export const WallpaperCropperModal: React.FC<WallpaperCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  config,
  onApply,
}) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(16 / 9); // default 16:9 Screen
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(config.rotation || 0);
  const [flipH, setFlipH] = useState(config.flipH || false);
  const [flipV, setFlipV] = useState(config.flipV || false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset adjustments when modal opens or image source changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(config.rotation || 0);
      setFlipH(config.flipH || false);
      setFlipV(config.flipV || false);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc, config]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const toggleFlipH = () => setFlipH((prev) => !prev);
  const toggleFlipV = () => setFlipV((prev) => !prev);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleApply = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Create canvas to export the framed wallpaper
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        if (img.complete) resolve(true);
        img.onload = () => resolve(true);
        img.onerror = (e) => reject(e);
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Target canvas dimensions based on chosen aspect ratio
      let targetWidth = img.naturalWidth || 1920;
      let targetHeight = img.naturalHeight || 1080;

      if (aspectRatio) {
        if (aspectRatio >= 1) {
          targetWidth = Math.min(targetWidth, 3840);
          targetHeight = Math.round(targetWidth / aspectRatio);
        } else {
          targetHeight = Math.min(targetHeight, 2160);
          targetWidth = Math.round(targetHeight * aspectRatio);
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.save();
      // Center canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply Flip
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply Zoom
      ctx.scale(zoom, zoom);

      // Map on-screen pixel pan to canvas image coordinates
      const imgElem = imageRef.current;
      const renderedWidth = imgElem ? imgElem.offsetWidth || 1 : 1;
      const panScale = targetWidth / renderedWidth;

      ctx.drawImage(
        img,
        -targetWidth / 2 + (pan.x * panScale) / zoom,
        -targetHeight / 2 + (pan.y * panScale) / zoom,
        targetWidth,
        targetHeight
      );

      ctx.restore();

      // Export canvas directly to RAW Blob for IndexedDB storage
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );

      if (blob) {
        const customBlobId = "radjaos_custom_cropped_wallpaper";
        await saveWallpaperBlob(customBlobId, blob, "custom-wallpaper-cropped.png");

        onApply({
          ...config,
          type: "custom_raw",
          rawBlobId: customBlobId,
          flipH: false,
          flipV: false,
          rotation: 0,
        });
      } else {
        // Fallback update parameters without canvas export
        onApply({
          ...config,
          rotation,
          flipH,
          flipV,
        });
      }

      onClose();
    } catch (err) {
      console.warn("Falling back to parameter update due to export error:", err);
      // Fallback parameter update if CORS or canvas export fails
      onApply({
        ...config,
        rotation,
        flipH,
        flipV,
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    imageSrc,
    aspectRatio,
    rotation,
    flipH,
    flipV,
    zoom,
    pan,
    config,
    onApply,
    onClose,
  ]);

  // Keyboard shortcut listener (Enter = Apply, Esc = Cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !isProcessing) {
        handleApply();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, handleApply, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-neutral-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed with prominent primary action buttons */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">
              Wallpaper Framing & Cropper
            </h3>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Raw Canvas Engine
            </span>
          </div>

          {/* Quick Header Actions - Always visible, never cut off */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isProcessing ? "Processing..." : "Apply Wallpaper"}</span>
            </button>
          </div>
        </div>

        {/* Step Guide Banner */}
        <div className="flex-shrink-0 px-4 py-1.5 bg-blue-950/40 border-b border-blue-500/20 text-[11px] text-blue-200/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 font-bold flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Drag image to reposition • Zoom or rotate</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Click "Apply Wallpaper" to save</span>
          </div>
        </div>

        {/* Canvas / Viewport Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative flex-1 min-h-0 bg-neutral-950 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
          style={{ maxHeight: "46vh" }}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Framing Target Box */}
          <div
            className="relative border-2 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.25)] overflow-hidden pointer-events-none flex items-center justify-center bg-black/50"
            style={{
              width: aspectRatio ? (aspectRatio >= 1 ? "85%" : "45%") : "85%",
              aspectRatio: aspectRatio ? `${aspectRatio}` : "16/9",
              maxHeight: "42vh",
            }}
          >
            {/* Rule of thirds grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/10 pointer-events-none">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>

            {/* Transformed Image Preview */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="max-w-none transition-transform pointer-events-auto select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                  flipH ? -1 : 1
                }) scaleY(${flipV ? -1 : 1})`,
                maxHeight: "40vh",
                userSelect: "none",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Toolbar & Controls - Always Visible (flex-shrink-0) */}
        <div className="flex-shrink-0 p-3 bg-neutral-950/95 border-t border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Aspect Ratio Options */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setAspectRatio(16 / 9)}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  aspectRatio === 16 / 9
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Screen</span>
              </button>

              <button
                onClick={() => setAspectRatio(9 / 16)}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  aspectRatio === 9 / 16
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Mobile</span>
              </button>

              <button
                onClick={() => setAspectRatio(null)}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  aspectRatio === null
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Freeform</span>
              </button>
            </div>

            {/* Transform Controls (Rotate & Flip & Reset) */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-white/10">
              <button
                onClick={rotateLeft}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={rotateRight}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-white/10 mx-0.5" />
              <button
                onClick={toggleFlipH}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  flipH
                    ? "bg-blue-600/30 text-blue-400"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
                title="Flip Horizontal (Mirror)"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleFlipV}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  flipV
                    ? "bg-blue-600/30 text-blue-400"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-white/10 mx-0.5" />
              <button
                onClick={handleReset}
                className="px-2 py-1 rounded-lg text-neutral-400 hover:text-white text-[11px] transition-colors cursor-pointer"
                title="Reset Zoom, Pan and Rotation"
              >
                Reset Center
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-neutral-900 px-2.5 py-1 rounded-xl border border-white/10">
              <button
                onClick={() =>
                  setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(1))))
                }
                className="text-neutral-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-neutral-300 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() =>
                  setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(1))))
                }
                className="text-neutral-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[11px] text-neutral-500 truncate mr-2">
              Tip: Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 border border-white/10 text-[10px] text-neutral-300 font-mono">Enter</kbd> to apply or <kbd className="px-1 py-0.5 rounded bg-neutral-800 border border-white/10 text-[10px] text-neutral-300 font-mono">Esc</kbd> to cancel.
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{isProcessing ? "Processing..." : "Apply Wallpaper"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
