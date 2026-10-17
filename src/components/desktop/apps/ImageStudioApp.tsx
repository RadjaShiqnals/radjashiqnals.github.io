import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Wand2,
  Eraser,
  Paintbrush,
  Crop,
  Sliders,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Upload,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Eye,
  Check,
  Sparkles,
  RefreshCw,
  Copy,
  Image as ImageIcon,
  ShieldCheck,
  Smartphone,
  Monitor,
  Square,
  AlertCircle,
  MousePointerClick,
  Zap,
  X,
  History,
  HardDrive,
  Trash2,
} from "lucide-react";

import { type Locale } from "../../../lib/i18n";
import { removeBackground, preload } from "@imgly/background-removal";
import { saveWallpaperBlob } from "../../../lib/wallpaper-db";

import { WALLPAPER_CHANGE_EVENT } from "../../../lib/wallpaper-state";

export type StudioTab = "bg_removal" | "crop" | "filters" | "transform";
export type BrushMode = "wand" | "erase" | "restore";
export type BgPreviewMode = "transparent" | "white" | "dark" | "red" | "blue" | "custom";

export interface StudioPhotoHistoryItem {
  id: string;
  name: string;
  width: number;
  height: number;
  dataUrl: string;
  originalDataUrl?: string;
  byteSize: number;
  updatedAt: number;
}

const LS_HISTORY_KEY = "radjaos_studio_photo_history_v1";
const LS_ACTIVE_ID_KEY = "radjaos_studio_active_id_v1";
const SS_DETECTED_MAX_KEY = "radjaos_native_ls_max_bytes_v1";
const LS_PROBE_KEY = "__radjaos_ls_quota_probe__";
const DEFAULT_LS_QUOTA_CHARS = 5 * 1024 * 1024; // 5.00 MB (5,242,880 units) standard native browser quota

function getTotalLocalStorageBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === LS_PROBE_KEY) continue;
      const v = localStorage.getItem(k) || "";
      total += k.length + v.length;
    }
  } catch {}
  return total;
}

function getOtherLocalStorageBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === LS_HISTORY_KEY || k === LS_ACTIVE_ID_KEY || k === LS_PROBE_KEY) continue;
      const v = localStorage.getItem(k) || "";
      total += k.length + v.length;
    }
  } catch {}
  return total;
}

function detectNativeLocalStorageMaxBytes(): number {
  if (typeof window === "undefined") return DEFAULT_LS_QUOTA_CHARS;
  try {
    const cached = sessionStorage.getItem(SS_DETECTED_MAX_KEY);
    if (cached) {
      const parsed = parseInt(cached, 10);
      if (parsed > 500_000) return parsed;
    }

    const usedBefore = getTotalLocalStorageBytes();
    const stepUnit = 64 * 1024; // 64 KB granularity
    const unitBlock = "a".repeat(stepUnit);
    let lowSteps = 0;
    let highSteps = 160; // Up to 10 MB probe ceiling
    let bestExtra = 0;

    while (lowSteps <= highSteps) {
      const midSteps = (lowSteps + highSteps) >> 1;
      const testPayload = unitBlock.repeat(midSteps);
      try {
        localStorage.setItem(LS_PROBE_KEY, testPayload);
        bestExtra = testPayload.length + LS_PROBE_KEY.length;
        lowSteps = midSteps + 1;
      } catch {
        highSteps = midSteps - 1;
      }
    }
    localStorage.removeItem(LS_PROBE_KEY);

    let detectedTotal = usedBefore + bestExtra;
    if (detectedTotal < 500_000) {
      detectedTotal = DEFAULT_LS_QUOTA_CHARS;
    } else if (Math.abs(detectedTotal - DEFAULT_LS_QUOTA_CHARS) <= 128 * 1024) {
      // Snap to exact 5.00 MB if within probe granularity of Chromium/Firefox/Safari standard 5MB quota
      detectedTotal = DEFAULT_LS_QUOTA_CHARS;
    }

    sessionStorage.setItem(SS_DETECTED_MAX_KEY, String(detectedTotal));
    return detectedTotal;
  } catch {
    try {
      localStorage.removeItem(LS_PROBE_KEY);
    } catch {}
    return DEFAULT_LS_QUOTA_CHARS;
  }
}

function encodeCanvasForStorage(
  sourceCanvas: HTMLCanvasElement,
  quality = 0.86,
  maxDim = 1600
): string {
  let targetCanvas = sourceCanvas;
  if (sourceCanvas.width > maxDim || sourceCanvas.height > maxDim) {
    const scale = Math.min(maxDim / sourceCanvas.width, maxDim / sourceCanvas.height);
    targetCanvas = document.createElement("canvas");
    targetCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
    targetCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));
    const ctx = targetCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
    }
  }
  // WebP preserves full alpha transparency (AI Cutout / Magic Wand / Brush) with high compression
  const webpUrl = targetCanvas.toDataURL("image/webp", quality);
  if (webpUrl.startsWith("data:image/webp")) {
    return webpUrl;
  }
  return targetCanvas.toDataURL("image/png");
}

function formatStorageSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Yield control back to the browser main thread (modern-web-guidance: break-up-long-tasks)
async function yieldToMainThread(): Promise<void> {
  if (
    typeof window !== "undefined" &&
    "scheduler" in window &&
    typeof (window as unknown as { scheduler?: { yield?: () => Promise<void> } }).scheduler?.yield === "function"
  ) {
    await (window as unknown as { scheduler: { yield: () => Promise<void> } }).scheduler.yield();
  } else {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}

interface ImageStudioAppProps {
  locale: Locale;
}

const SAMPLE_IMAGES = [
  {
    name: "Radja Avatar",
    path: "/image/about-me-profile.png",
    desc: "Portrait photo with background",
  },
  {
    name: "Portrait Demo",
    path: "/image/1080PotraitExample.png",
    desc: "Vertical studio portrait",
  },
  {
    name: "Landscape Demo",
    path: "/image/1080LandscapeExample.png",
    desc: "Landscape view",
  },
  {
    name: "Product Box",
    path: "/image/1080BoxExample.png",
    desc: "Clear product on background",
  },
];

const FILTER_PRESETS = [
  { name: "Normal", brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hue: 0, blur: 0 },
  { name: "Vivid Pop", brightness: 105, contrast: 120, saturation: 140, sepia: 0, grayscale: 0, hue: 0, blur: 0 },
  { name: "B&W High Contrast", brightness: 110, contrast: 145, saturation: 0, sepia: 0, grayscale: 100, hue: 0, blur: 0 },
  { name: "Warm Vintage", brightness: 105, contrast: 110, saturation: 90, sepia: 40, grayscale: 0, hue: 0, blur: 0 },
  { name: "Cool Slate", brightness: 100, contrast: 110, saturation: 85, sepia: 0, grayscale: 0, hue: 190, blur: 0 },
  { name: "Cyberpunk", brightness: 110, contrast: 130, saturation: 160, sepia: 0, grayscale: 0, hue: 170, blur: 0 },
];

export const ImageStudioApp: React.FC<ImageStudioAppProps> = ({ locale }) => {
  // Master image state
  const [imageName, setImageName] = useState<string>("image.png");
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Persistent Browser localStorage Photo History State
  const [photoHistory, setPhotoHistory] = useState<StudioPhotoHistoryItem[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [lsStorageStats, setLsStorageStats] = useState<{
    usedBytes: number;
    historyBytes: number;
    maxBytes: number;
  }>({
    usedBytes: 0,
    historyBytes: 0,
    maxBytes: DEFAULT_LS_QUOTA_CHARS,
  });
  const photoHistoryRef = useRef<StudioPhotoHistoryItem[]>([]);
  const activePhotoIdRef = useRef<string | null>(null);
  const hasRestoredFromStorageRef = useRef<boolean>(false);
  const syncTimerRef = useRef<number | null>(null);

  // Tool Tabs
  const [activeTab, setActiveTab] = useState<StudioTab>("bg_removal");

  // History for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Zoom & View
  const [zoom, setZoom] = useState<number>(1);
  const [bgPreview, setBgPreview] = useState<BgPreviewMode>("transparent");
  const [customBgColor, setCustomBgColor] = useState<string>("#3b82f6");
  const [showOriginalPeek, setShowOriginalPeek] = useState<boolean>(false);

  // AI Background Removal state
  const [aiConsentGiven, setAiConsentGiven] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("radjaos_ai_bg_consent") === "true";
    }
    return false;
  });
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiProgressPhase, setAiProgressPhase] = useState<string>("");
  const [aiProgressPercent, setAiProgressPercent] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStartTime, setAiStartTime] = useState<number | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [aiModel, setAiModel] = useState<"isnet_fp16" | "isnet_quint8">("isnet_fp16");
  const [protectSubject, setProtectSubject] = useState<boolean>(true);
  const [fillInnerHoles, setFillInnerHoles] = useState<boolean>(true);
  const [edgeFeather, setEdgeFeather] = useState<number>(1);
  const [hasAiMaskCached, setHasAiMaskCached] = useState<boolean>(false);

  // Retouch Mode (remove.bg style: Magic Wand, Erase, Recover)
  const [brushMode, setBrushMode] = useState<BrushMode>("wand");
  const [brushSize, setBrushSize] = useState<number>(28);
  const [brushHardness, setBrushHardness] = useState<number>(0.8);
  const [wandTolerance, setWandTolerance] = useState<number>(35);
  const [wandContiguous, setWandContiguous] = useState<boolean>(true);
  const [isBrushing, setIsBrushing] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Crop State
  const [cropAspect, setCropAspect] = useState<number | null>(null); // null = freeform
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [cropDragMode, setCropDragMode] = useState<"move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null>(null);
  const cropStartRef = useRef<{ mouseX: number; mouseY: number; box: { x: number; y: number; width: number; height: number } }>({
    mouseX: 0,
    mouseY: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Color Filter Sliders
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    grayscale: 0,
    hue: 0,
    blur: 0,
  });

  // Export / Feedback Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastAiMaskRef = useRef<{
    width: number;
    height: number;
    rawMask: Uint8Array;
    originalImageData: ImageData;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Persist photo history to native browser localStorage with automatic oldest-eviction on quota limits
  const persistPhotoHistory = useCallback(
    (items: StudioPhotoHistoryItem[], nextActiveId: string | null): StudioPhotoHistoryItem[] => {
      if (typeof window === "undefined") return items;
      const maxBytes = detectNativeLocalStorageMaxBytes();
      const otherBytes = getOtherLocalStorageBytes();
      const working = [...items];

      // 1. Pre-evict oldest history items if projected payload exceeds 98% of native browser quota
      while (working.length > 1) {
        const serialized = JSON.stringify(working);
        const projectedTotal =
          otherBytes +
          LS_HISTORY_KEY.length +
          serialized.length +
          LS_ACTIVE_ID_KEY.length +
          (nextActiveId?.length || 0);
        if (projectedTotal <= maxBytes * 0.98) break;
        // Never evict the active photo; evict the oldest non-active photo
        const removeIdx =
          working[working.length - 1].id === nextActiveId ? working.length - 2 : working.length - 1;
        if (removeIdx < 0) break;
        working.splice(removeIdx, 1);
      }

      // 2. Commit to localStorage with native QuotaExceededError loop fallback
      let saved = false;
      while (working.length > 0 && !saved) {
        try {
          const serialized = JSON.stringify(working);
          localStorage.setItem(LS_HISTORY_KEY, serialized);
          if (nextActiveId) {
            localStorage.setItem(LS_ACTIVE_ID_KEY, nextActiveId);
          }
          saved = true;
        } catch {
          if (working.length > 1) {
            const removeIdx =
              working[working.length - 1].id === nextActiveId ? working.length - 2 : working.length - 1;
            if (removeIdx >= 0) {
              working.splice(removeIdx, 1);
              continue;
            }
          }
          // Single item still exceeded native quota: strip redundant originalDataUrl or compress further
          const single = working[0];
          if (single.originalDataUrl && single.originalDataUrl !== single.dataUrl) {
            working[0] = {
              ...single,
              originalDataUrl: undefined,
              byteSize: single.dataUrl.length,
            };
            continue;
          }
          if (canvasRef.current) {
            const tighterUrl = encodeCanvasForStorage(canvasRef.current, 0.72, 1024);
            working[0] = {
              ...single,
              dataUrl: tighterUrl,
              originalDataUrl: undefined,
              byteSize: tighterUrl.length,
            };
            try {
              localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(working));
              if (nextActiveId) localStorage.setItem(LS_ACTIVE_ID_KEY, nextActiveId);
              saved = true;
            } catch {}
          }
          break;
        }
      }

      if (working.length === 0) {
        try {
          localStorage.removeItem(LS_HISTORY_KEY);
          localStorage.removeItem(LS_ACTIVE_ID_KEY);
        } catch {}
      }

      const rawHistoryStr = localStorage.getItem(LS_HISTORY_KEY) || "";
      const historyBytes = rawHistoryStr ? LS_HISTORY_KEY.length + rawHistoryStr.length : 0;
      const usedBytes = getTotalLocalStorageBytes();

      photoHistoryRef.current = working;
      activePhotoIdRef.current = nextActiveId;
      setPhotoHistory(working);
      setActivePhotoId(nextActiveId);
      setLsStorageStats({
        usedBytes,
        historyBytes,
        maxBytes,
      });

      return working;
    },
    []
  );

  // Synchronize live canvas edits (AI Cutout, Brush, Crop, Filter, Transform, Undo/Redo) into active history item
  // Uses scheduler.yield() + debounce to avoid blocking main-thread frame rendering (modern-web-guidance: break-up-long-tasks)
  const syncActiveCanvasToHistory = useCallback(() => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = window.setTimeout(async () => {
      syncTimerRef.current = null;
      await yieldToMainThread();
      const canvas = canvasRef.current;
      const currentId = activePhotoIdRef.current;
      if (!canvas || !currentId) return;

      try {
        const updatedDataUrl = encodeCanvasForStorage(canvas);
        await yieldToMainThread();
        const updatedList = photoHistoryRef.current.map((item) => {
          if (item.id !== currentId) return item;
          const origLen =
            item.originalDataUrl && item.originalDataUrl !== updatedDataUrl
              ? item.originalDataUrl.length
              : 0;
          return {
            ...item,
            width: canvas.width,
            height: canvas.height,
            dataUrl: updatedDataUrl,
            byteSize: updatedDataUrl.length + origLen,
            updatedAt: Date.now(),
          };
        });
        persistPhotoHistory(updatedList, currentId);
      } catch (e) {
        console.warn("Could not sync canvas to localStorage history:", e);
      }
    }, 180);
  }, [persistPhotoHistory]);

  // Push canvas state to Undo History & persist active photo state
  const pushToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        // keep max 20 states to protect RAM
        if (sliced.length >= 20) sliced.shift();
        return [...sliced, snap];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 19));
      syncActiveCanvasToHistory();
    } catch (e) {
      console.warn("Failed to capture history snapshot:", e);
    }
  }, [historyIndex, syncActiveCanvasToHistory]);

  // Undo & Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const nextIndex = historyIndex - 1;
    const targetState = history[nextIndex];
    if (targetState) {
      canvas.width = targetState.width;
      canvas.height = targetState.height;
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(nextIndex);
      setImageDims({ width: targetState.width, height: targetState.height });
      syncActiveCanvasToHistory();
      showToast("Undo");
    }
  }, [history, historyIndex, syncActiveCanvasToHistory]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const nextIndex = historyIndex + 1;
    const targetState = history[nextIndex];
    if (targetState) {
      canvas.width = targetState.width;
      canvas.height = targetState.height;
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(nextIndex);
      setImageDims({ width: targetState.width, height: targetState.height });
      syncActiveCanvasToHistory();
      showToast("Redo");
    }
  }, [history, historyIndex, syncActiveCanvasToHistory]);

  // Keyboard shortcut listener (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        setIsExportMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Load image into canvas and automatically attach to persistent localStorage history
  const loadImage = useCallback(
    (
      src: string,
      name = "image.png",
      options?: {
        existingHistoryId?: string;
        originalSrc?: string;
        skipPersist?: boolean;
      }
    ) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (options?.originalSrc && options.originalSrc !== src) {
          const origImg = new Image();
          origImg.crossOrigin = "anonymous";
          origImg.onload = () => {
            originalImageRef.current = origImg;
          };
          origImg.src = options.originalSrc;
          originalImageRef.current = img;
        } else {
          originalImageRef.current = img;
        }

        setImageName(name);
        setImageDims({ width: img.naturalWidth, height: img.naturalHeight });

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([initialData]);
            setHistoryIndex(0);
          }

          if (!options?.skipPersist) {
            try {
              const encodedDataUrl = encodeCanvasForStorage(canvas);
              const currentList = photoHistoryRef.current;

              if (options?.existingHistoryId) {
                activePhotoIdRef.current = options.existingHistoryId;
                setActivePhotoId(options.existingHistoryId);
                try {
                  localStorage.setItem(LS_ACTIVE_ID_KEY, options.existingHistoryId);
                } catch {}
              } else {
                // Check if an identical named + sized entry already exists so we promote/update it instead of duplicating
                const existingIdx = currentList.findIndex(
                  (item) =>
                    item.name === name &&
                    item.width === img.naturalWidth &&
                    item.height === img.naturalHeight
                );

                const itemId =
                  existingIdx >= 0
                    ? currentList[existingIdx].id
                    : `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

                const newEntry: StudioPhotoHistoryItem = {
                  id: itemId,
                  name,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  dataUrl: encodedDataUrl,
                  originalDataUrl: encodedDataUrl,
                  byteSize: encodedDataUrl.length,
                  updatedAt: Date.now(),
                };

                const filtered = currentList.filter((item) => item.id !== itemId);
                persistPhotoHistory([newEntry, ...filtered], itemId);
              }
            } catch (err) {
              console.warn("Failed to persist uploaded image to localStorage:", err);
            }
          }
        }

        lastAiMaskRef.current = null;
        setHasAiMaskCached(false);

        // Initialize crop box to 80% center
        setCropBox({
          x: Math.round(img.naturalWidth * 0.1),
          y: Math.round(img.naturalHeight * 0.1),
          width: Math.round(img.naturalWidth * 0.8),
          height: Math.round(img.naturalHeight * 0.8),
        });

        // Fit zoom nicely
        if (viewportRef.current) {
          const vw = viewportRef.current.clientWidth || 800;
          const vh = viewportRef.current.clientHeight || 500;
          const scale = Math.min((vw - 60) / img.naturalWidth, (vh - 60) / img.naturalHeight, 1);
          setZoom(Number(Math.max(0.1, scale).toFixed(2)));
        }
      };
      img.src = src;
    },
    [persistPhotoHistory]
  );

  // History Item Actions: Select, Delete Single, Clear All
  const handleSelectHistoryPhoto = useCallback(
    (item: StudioPhotoHistoryItem) => {
      loadImage(item.dataUrl, item.name, {
        existingHistoryId: item.id,
        originalSrc: item.originalDataUrl || item.dataUrl,
      });
      showToast(`Loaded "${item.name}" from history ✨`);
    },
    [loadImage]
  );

  const handleDeleteHistoryPhoto = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const remaining = photoHistoryRef.current.filter((item) => item.id !== id);
      let nextActive = activePhotoIdRef.current;

      if (nextActive === id) {
        if (remaining.length > 0) {
          nextActive = remaining[0].id;
          loadImage(remaining[0].dataUrl, remaining[0].name, {
            existingHistoryId: remaining[0].id,
            originalSrc: remaining[0].originalDataUrl || remaining[0].dataUrl,
            skipPersist: true,
          });
        } else {
          nextActive = null;
        }
      }

      persistPhotoHistory(remaining, nextActive);
      showToast("Removed photo from history");
    },
    [loadImage, persistPhotoHistory]
  );

  const handleClearAllHistory = useCallback(() => {
    persistPhotoHistory([], null);
    showToast("Cleared localStorage photo history");
  }, [persistPhotoHistory]);

  // Handle File Input Selection
  // Note: Browser extensions like Copy-n-Paste prepend [...originalInput.files] at index 0 before appending the new
  // clipboard file at the end, keeping input.value ("C:\\fakepath\\" + files[0].name) unchanged and causing React's
  // internal _valueTracker to ignore the synthetic onChange event.
  // We solve both by:
  // 1) Always picking the newest file at files[files.length - 1]
  // 2) Immediately resetting input.value = "" so originalInput.files is always empty
  // 3) Binding a native DOM 'change' listener to bypass React's _valueTracker deduplication
  const processInputFiles = useCallback(
    (inputEl: HTMLInputElement) => {
      const files = inputEl.files;
      if (!files || files.length === 0) return;
      const file = files[files.length - 1];
      const url = URL.createObjectURL(file);
      loadImage(url, file.name || "clipboard-image.png");
      showToast(`Loaded ${file.name || "clipboard image"} ✨`);
      inputEl.value = "";
    },
    [loadImage]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInputFiles(e.currentTarget);
  };

  useEffect(() => {
    const inputEl = fileInputRef.current;
    if (!inputEl) return;
    const handleNativeChange = () => {
      processInputFiles(inputEl);
    };
    inputEl.addEventListener("change", handleNativeChange);
    return () => inputEl.removeEventListener("change", handleNativeChange);
  }, [processInputFiles]);

  // Direct 1-Click Clipboard Paste via Async Clipboard API
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        showToast("Press Ctrl+V to paste image from clipboard");
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split("/")[1] || "png";
          const url = URL.createObjectURL(blob);
          if (fileInputRef.current) fileInputRef.current.value = "";
          loadImage(url, `clipboard.${ext}`);
          showToast("Pasted image from clipboard ✨");
          return;
        }
      }
      showToast("No image found in clipboard!");
    } catch (err) {
      console.warn("Clipboard read error:", err);
      showToast("Press Ctrl+V to paste image");
    }
  }, [loadImage]);

  // Drag and drop onto workspace
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[files.length - 1];
    if (file && file.type.startsWith("image/")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      const url = URL.createObjectURL(file);
      loadImage(url, file.name);
      showToast(`Loaded ${file.name} ✨`);
    }
  };

  // Paste image from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if Copy-n-Paste overlay is currently open so it can handle its own preview
      if (document.querySelector(".cnp-overlay")) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            const url = URL.createObjectURL(file);
            loadImage(url, file.name || "pasted-image.png");
            showToast("Pasted image from clipboard ✨");
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadImage]);

  // =========================================================================
  // 1. AI BACKGROUND REMOVAL (100% IN-BROWSER ONNX / WASM)
  // =========================================================================

  const handlePreloadAi = async () => {
    setIsAiProcessing(true);
    setAiError(null);
    setAiProgressPhase(`Initializing local WebAssembly & downloading ${aiModel === "isnet_fp16" ? "FP16" : "INT8"} AI model...`);
    setAiProgressPercent(null);
    setAiStartTime(Date.now());

    try {
      await preload({
        model: aiModel,
        proxyToWorker: false,
        progress: (key: string, current: number, total: number) => {
          let phase = `Downloading AI Model weights (~${aiModel === "isnet_fp16" ? "44" : "35"}MB)...`;
          if (key.includes("wasm")) phase = "Compiling WASM runtime...";
          setAiProgressPhase(phase);
          if (total > 0) {
            setAiProgressPercent(Math.min(100, Math.round((current / total) * 100)));
          }
        },
      });

      setAiConsentGiven(true);
      setShowConsentModal(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("radjaos_ai_bg_consent", "true");
      }
      showToast("Local AI Model Ready (Cached) ✨");
    } catch (err) {
      console.error("AI Preload failed:", err);
      setAiError(
        `Failed to download AI model: ${(err as Error).message || "Network timeout"}. You can use Magic Wand for instant removal without download.`
      );
    } finally {
      setIsAiProcessing(false);
      setAiProgressPercent(null);
      setAiStartTime(null);
    }
  };

  // Hybrid Post-Processing Engine:
  // 1. Inverted Pose & Subject Protection: Border-seeded flood-fill to isolate true outer background,
  //    stopping at sketch lines/contrast gradients so upside-down faces (like Kaneki 545909.jpg), white teeth,
  //    white hair strands, and fingers are never accidentally hollowed out.
  // 2. Inner Hole Filling: Fills enclosed transparent pinholes (eyes, teeth, highlights) back to solid.
  // 3. Antialiased Feathering: Smooths transition borders between foreground and background.
  const applyRefinedMask = useCallback(
    (
      rawMask: Uint8Array,
      origImageData: ImageData,
      optProtect: boolean,
      optFillHoles: boolean,
      optFeather: number
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const width = origImageData.width;
      const height = origImageData.height;
      const totalPixels = width * height;
      const origData = origImageData.data;

      const mask = new Uint8Array(rawMask);

      // 1. Smart Subject & Inverted Pose Protection
      if (optProtect) {
        // Luminance map: Y = 0.299 R + 0.587 G + 0.114 B
        const lum = new Uint8Array(totalPixels);
        for (let i = 0; i < totalPixels; i++) {
          const p4 = i * 4;
          lum[i] = Math.round(0.299 * origData[p4] + 0.587 * origData[p4 + 1] + 0.114 * origData[p4 + 2]);
        }

        // Determine outer border background luminance envelope
        let minBorderLum = 255;
        let maxBorderLum = 0;
        const sampleLum = (idx: number) => {
          const l = lum[idx];
          if (l < minBorderLum) minBorderLum = l;
          if (l > maxBorderLum) maxBorderLum = l;
        };

        for (let x = 0; x < width; x++) {
          sampleLum(x); // top border
          sampleLum((height - 1) * width + x); // bottom border
        }
        for (let y = 0; y < height; y++) {
          sampleLum(y * width); // left border
          sampleLum(y * width + (width - 1)); // right border
        }

        // Local 3x3 contrast / edge detection:
        // High contrast marks sketch lineart, hair tips, and subject contours
        const isEdge = new Uint8Array(totalPixels);
        const edgeThresh = 22;

        for (let y = 1; y < height - 1; y++) {
          const row = y * width;
          for (let x = 1; x < width - 1; x++) {
            const i = row + x;
            let minL = 255;
            let maxL = 0;
            for (let dy = -1; dy <= 1; dy++) {
              const nr = (y + dy) * width;
              for (let dx = -1; dx <= 1; dx++) {
                const l = lum[nr + (x + dx)];
                if (l < minL) minL = l;
                if (l > maxL) maxL = l;
              }
            }
            if (maxL - minL >= edgeThresh) {
              isEdge[i] = 1;
            }
          }
        }

        // BFS Flood-fill strictly from outer borders to identify true exterior background
        const isExteriorBg = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        const trySeed = (idx: number) => {
          if (!isExteriorBg[idx] && !isEdge[idx]) {
            isExteriorBg[idx] = 1;
            queue[tail++] = idx;
          }
        };

        for (let x = 0; x < width; x++) {
          trySeed(x);
          trySeed((height - 1) * width + x);
        }
        for (let y = 0; y < height; y++) {
          trySeed(y * width);
          trySeed(y * width + (width - 1));
        }

        const minAllowedBgLum = Math.max(0, minBorderLum - 25);
        const maxAllowedBgLum = Math.min(255, maxBorderLum + 25);

        while (head < tail) {
          const curr = queue[head++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          const cp4 = curr * 4;
          const cr = origData[cp4];
          const cg = origData[cp4 + 1];
          const cb = origData[cp4 + 2];

          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1,
          ];

          for (const n of neighbors) {
            if (n === -1 || isExteriorBg[n] || isEdge[n]) continue;
            const nLum = lum[n];
            if (nLum < minAllowedBgLum || nLum > maxAllowedBgLum) continue;

            const np4 = n * 4;
            const dist =
              Math.abs(cr - origData[np4]) +
              Math.abs(cg - origData[np4 + 1]) +
              Math.abs(cb - origData[np4 + 2]);
            if (dist > 30) continue; // Boundary barrier

            isExteriorBg[n] = 1;
            queue[tail++] = n;
          }
        }

        // Recover subject interior:
        // Any pixel that is NOT exterior background (i.e. enclosed inside subject boundaries)
        // is protected from being erased!
        for (let i = 0; i < totalPixels; i++) {
          if (!isExteriorBg[i]) {
            if (mask[i] < 200) {
              mask[i] = 255;
            }
          }
        }
      }

      // 2. Inner Hole Filling
      if (optFillHoles) {
        const isBorderTransparent = new Uint8Array(totalPixels);
        const holeQueue = new Int32Array(totalPixels);
        let hHead = 0;
        let hTail = 0;

        const trySeedHole = (idx: number) => {
          if (mask[idx] < 128 && !isBorderTransparent[idx]) {
            isBorderTransparent[idx] = 1;
            holeQueue[hTail++] = idx;
          }
        };

        for (let x = 0; x < width; x++) {
          trySeedHole(x);
          trySeedHole((height - 1) * width + x);
        }
        for (let y = 0; y < height; y++) {
          trySeedHole(y * width);
          trySeedHole(y * width + (width - 1));
        }

        while (hHead < hTail) {
          const curr = holeQueue[hHead++];
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1,
          ];

          for (const n of neighbors) {
            if (n === -1 || isBorderTransparent[n]) continue;
            if (mask[n] < 128) {
              isBorderTransparent[n] = 1;
              holeQueue[hTail++] = n;
            }
          }
        }

        for (let i = 0; i < totalPixels; i++) {
          if (mask[i] < 128 && !isBorderTransparent[i]) {
            mask[i] = 255;
          }
        }
      }

      // 3. Edge Feathering
      const finalAlpha = new Uint8ClampedArray(totalPixels);
      if (optFeather > 0) {
        for (let y = 0; y < height; y++) {
          const row = y * width;
          for (let x = 0; x < width; x++) {
            const idx = row + x;
            const selfVal = mask[idx];
            if (selfVal === 0 || selfVal === 255) {
              let hasDiff = false;
              if (x > 0 && mask[idx - 1] !== selfVal) hasDiff = true;
              else if (x < width - 1 && mask[idx + 1] !== selfVal) hasDiff = true;
              else if (y > 0 && mask[idx - width] !== selfVal) hasDiff = true;
              else if (y < height - 1 && mask[idx + width] !== selfVal) hasDiff = true;

              if (hasDiff) {
                let sum = selfVal * 2;
                let count = 2;
                if (x > 0) { sum += mask[idx - 1]; count++; }
                if (x < width - 1) { sum += mask[idx + 1]; count++; }
                if (y > 0) { sum += mask[idx - width]; count++; }
                if (y < height - 1) { sum += mask[idx + width]; count++; }
                finalAlpha[idx] = Math.round(sum / count);
              } else {
                finalAlpha[idx] = selfVal;
              }
            } else {
              finalAlpha[idx] = selfVal;
            }
          }
        }
      } else {
        for (let i = 0; i < totalPixels; i++) {
          finalAlpha[i] = mask[i];
        }
      }

      // 4. Compose final ImageData
      const outImgData = ctx.createImageData(width, height);
      const outData = outImgData.data;
      for (let i = 0; i < totalPixels; i++) {
        const p4 = i * 4;
        outData[p4] = origData[p4];
        outData[p4 + 1] = origData[p4 + 1];
        outData[p4 + 2] = origData[p4 + 2];
        outData[p4 + 3] = finalAlpha[i];
      }

      ctx.putImageData(outImgData, 0, 0);
      pushToHistory();
    },
    [pushToHistory]
  );

  const handleRetuneMask = useCallback(
    (newProtect: boolean, newFillHoles: boolean, newFeather: number) => {
      setProtectSubject(newProtect);
      setFillInnerHoles(newFillHoles);
      setEdgeFeather(newFeather);

      if (lastAiMaskRef.current) {
        const { rawMask, originalImageData } = lastAiMaskRef.current;
        applyRefinedMask(rawMask, originalImageData, newProtect, newFillHoles, newFeather);
        showToast("AI Mask Updated ✨");
      }
    },
    [applyRefinedMask]
  );

  const startAiRemoval = async () => {
    if (!canvasRef.current) return;
    setIsAiProcessing(true);
    setAiError(null);
    setAiProgressPhase(`Starting ${aiModel === "isnet_fp16" ? "FP16 High Precision" : "INT8"} AI Segmentation...`);
    setAiProgressPercent(null);
    setAiStartTime(Date.now());
    setShowConsentModal(false);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not access canvas context");

      // Save pristine pre-cutout image data for subject recovery
      const origImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const canvasBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!canvasBlob) throw new Error("Could not read canvas image");

      const cutoutBlob = await removeBackground(canvasBlob, {
        model: aiModel,
        proxyToWorker: false,
        progress: (key: string, current: number, total: number) => {
          let phase = `AI Neural Segmentation (${aiModel === "isnet_fp16" ? "FP16" : "INT8"})...`;
          if (key.includes("fetch")) {
            phase = `Downloading AI Model weights (~${aiModel === "isnet_fp16" ? "44" : "35"}MB)...`;
          } else if (key.includes("inference")) {
            phase = "Computing neural foreground mask...";
          } else if (key.includes("mask") || key.includes("alpha")) {
            phase = "Refining transparent edges...";
          }
          setAiProgressPhase(phase);
          if (total > 0) {
            setAiProgressPercent(Math.min(100, Math.round((current / total) * 100)));
          }
        },
      });

      const cutoutUrl = URL.createObjectURL(cutoutBlob);
      const cutoutImg = new Image();
      cutoutImg.onload = () => {
        // Render cutout into offscreen canvas to extract raw AI alpha
        const offCanvas = document.createElement("canvas");
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        const offCtx = offCanvas.getContext("2d");
        if (offCtx) {
          offCtx.drawImage(cutoutImg, 0, 0);
          const cutoutData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
          const total = canvas.width * canvas.height;
          const rawMask = new Uint8Array(total);
          for (let i = 0; i < total; i++) {
            rawMask[i] = cutoutData.data[i * 4 + 3];
          }

          // Cache in ref for instant 0ms slider re-tuning
          lastAiMaskRef.current = {
            width: canvas.width,
            height: canvas.height,
            rawMask,
            originalImageData: origImageData,
          };
          setHasAiMaskCached(true);

          // Apply refined mask with subject protection & hole-fill
          applyRefinedMask(rawMask, origImageData, protectSubject, fillInnerHoles, edgeFeather);
          showToast("AI Cutout Complete with Subject Protection! 🌟");
        }
        URL.revokeObjectURL(cutoutUrl);
      };
      cutoutImg.src = cutoutUrl;
      setAiConsentGiven(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("radjaos_ai_bg_consent", "true");
      }
    } catch (err) {
      console.error("AI BG removal error:", err);
      const msg = (err as Error).message || "Background removal failed";
      setAiError(
        `AI download/inference error: ${msg}. If CDN is slow or blocked, use Magic Wand or Border Chroma for instant offline removal!`
      );
    } finally {
      setIsAiProcessing(false);
      setAiProgressPercent(null);
      setAiStartTime(null);
    }
  };

  const handleRemoveBackgroundAi = () => {
    if (!aiConsentGiven) {
      setShowConsentModal(true);
    } else {
      startAiRemoval();
    }
  };

  // Instant Magic Wand: Click any pixel to erase connected or global matching color
  const applyMagicWand = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const px = Math.floor(startX);
    const py = Math.floor(startY);
    if (px < 0 || px >= width || py < 0 || py >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const startIndex = (py * width + px) * 4;
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    if (targetA === 0) {
      showToast("Area is already transparent!");
      return;
    }

    const colorMatch = (idx: number) => {
      const a = data[idx + 3];
      if (a === 0) return false;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const dist = Math.hypot(r - targetR, g - targetG, b - targetB);
      return dist <= wandTolerance;
    };

    if (wandContiguous) {
      // 4-way BFS Flood Fill with Int32Array queue
      const visited = new Uint8Array(width * height);
      const queue = new Int32Array(width * height);
      let head = 0;
      let tail = 0;

      const startIdx = py * width + px;
      queue[tail++] = startIdx;
      visited[startIdx] = 1;

      while (head < tail) {
        const curr = queue[head++];
        const cx = curr % width;
        const cy = Math.floor(curr / width);
        const p4 = curr * 4;

        data[p4 + 3] = 0; // Make transparent

        // West
        if (cx > 0) {
          const n = curr - 1;
          if (!visited[n] && colorMatch(n * 4)) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
        // East
        if (cx < width - 1) {
          const n = curr + 1;
          if (!visited[n] && colorMatch(n * 4)) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
        // North
        if (cy > 0) {
          const n = curr - width;
          if (!visited[n] && colorMatch(n * 4)) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
        // South
        if (cy < height - 1) {
          const n = curr + width;
          if (!visited[n] && colorMatch(n * 4)) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
      }
    } else {
      // Global color eradication across entire canvas
      for (let i = 0; i < data.length; i += 4) {
        if (colorMatch(i)) {
          data[i + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    pushToHistory();
    showToast(`Magic Wand Erased BG (Tolerance: ${wandTolerance}) ✨`);
  };

  // Instant Fallback: Contiguous Border Chroma Key removal (Never damages interior face/teeth!)
  const handleQuickColorKeyRemoval = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const total = w * h;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample 4 corners
    const cornerCoords = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
    ];

    const targetColors = cornerCoords.map(([cx, cy]) => {
      const idx = (cy * w + cx) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    });

    const tolerance = wandTolerance || 38;

    const matchesAnyCorner = (p4: number) => {
      if (data[p4 + 3] === 0) return false;
      const r = data[p4];
      const g = data[p4 + 1];
      const b = data[p4 + 2];
      for (const tc of targetColors) {
        if (Math.hypot(r - tc.r, g - tc.g, b - tc.b) <= tolerance) {
          return true;
        }
      }
      return false;
    };

    // 4-way BFS flood-fill seeded from outer borders
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const trySeed = (idx: number) => {
      if (!visited[idx] && matchesAnyCorner(idx * 4)) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    };

    for (let x = 0; x < w; x++) {
      trySeed(x);
      trySeed((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      trySeed(y * w);
      trySeed(y * w + (w - 1));
    }

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);
      const p4 = curr * 4;

      data[p4 + 3] = 0; // Make transparent

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < w - 1 ? curr + 1 : -1,
        cy > 0 ? curr - w : -1,
        cy < h - 1 ? curr + w : -1,
      ];

      for (const n of neighbors) {
        if (n === -1 || visited[n]) continue;
        if (matchesAnyCorner(n * 4)) {
          visited[n] = 1;
          queue[tail++] = n;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    pushToHistory();
    showToast("Border Chroma Erased! ✨");
  };

  // =========================================================================
  // 2. RETOUCH BRUSH ENGINE (REMOVE.BG STYLE: ERASE & RESTORE)
  // =========================================================================

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawBrushStroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.save();
    if (brushMode === "erase") {
      // Erase mode: destination-out makes pixels transparent
      ctx.globalCompositeOperation = "destination-out";

      const radGrad = ctx.createRadialGradient(x, y, brushSize * (1 - brushHardness) * 0.5, x, y, brushSize);
      radGrad.addColorStop(0, "rgba(0,0,0,1)");
      radGrad.addColorStop(Math.max(0, brushHardness), "rgba(0,0,0,1)");
      radGrad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Restore mode: paints pixels back from the original image at exact coordinate!
      const original = originalImageRef.current;
      if (original) {
        ctx.globalCompositeOperation = "source-over";
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.clip();

        // Draw original matching exact dimensions
        ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
    ctx.restore();
  };

  const interpolateBrushStrokes = (x1: number, y1: number, x2: number, y2: number) => {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(1, brushSize * 0.25);
    const count = Math.ceil(dist / step);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      drawBrushStroke(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
    drawBrushStroke(x2, y2);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTab !== "bg_removal") return;
    const coords = getCanvasCoords(e);
    if (brushMode === "wand") {
      applyMagicWand(coords.x, coords.y);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsBrushing(true);
    lastPointRef.current = coords;
    drawBrushStroke(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setCursorPos({ x: coords.x, y: coords.y });

    if (!isBrushing || activeTab !== "bg_removal" || brushMode === "wand") return;
    if (lastPointRef.current) {
      interpolateBrushStrokes(lastPointRef.current.x, lastPointRef.current.y, coords.x, coords.y);
    } else {
      drawBrushStroke(coords.x, coords.y);
    }
    lastPointRef.current = coords;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isBrushing || brushMode === "wand") return;
    setIsBrushing(false);
    lastPointRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    pushToHistory();
  };

  // =========================================================================
  // 3. INTERACTIVE CROP ENGINE
  // =========================================================================

  const handleCropAspectChange = (aspect: number | null) => {
    setCropAspect(aspect);
    if (!cropBox || !imageDims.width || !imageDims.height) return;

    if (aspect === null) return;

    let newWidth = cropBox.width;
    let newHeight = Math.round(newWidth / aspect);

    if (newHeight > imageDims.height) {
      newHeight = imageDims.height;
      newWidth = Math.round(newHeight * aspect);
    }

    setCropBox({
      x: Math.max(0, Math.min(cropBox.x, imageDims.width - newWidth)),
      y: Math.max(0, Math.min(cropBox.y, imageDims.height - newHeight)),
      width: newWidth,
      height: newHeight,
    });
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !cropBox) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Bounds check
    const sx = Math.max(0, Math.round(cropBox.x));
    const sy = Math.max(0, Math.round(cropBox.y));
    const sw = Math.min(canvas.width - sx, Math.round(cropBox.width));
    const sh = Math.min(canvas.height - sy, Math.round(cropBox.height));

    if (sw <= 10 || sh <= 10) return;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = sw;
    croppedCanvas.height = sh;
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) return;

    croppedCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.width = sw;
    canvas.height = sh;
    ctx.clearRect(0, 0, sw, sh);
    ctx.drawImage(croppedCanvas, 0, 0);

    setImageDims({ width: sw, height: sh });
    setCropBox({
      x: Math.round(sw * 0.1),
      y: Math.round(sh * 0.1),
      width: Math.round(sw * 0.8),
      height: Math.round(sh * 0.8),
    });

    pushToHistory();
    showToast(`Cropped to ${sw} × ${sh} px`);
  };

  // Dragging the crop box & resize handles
  const handleCropMouseDown = (
    e: React.MouseEvent,
    mode: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  ) => {
    e.stopPropagation();
    setIsDraggingCrop(true);
    setCropDragMode(mode);
    if (cropBox) {
      cropStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        box: { ...cropBox },
      };
    }
  };

  useEffect(() => {
    if (!isDraggingCrop) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingCrop || !cropBox || !cropDragMode) return;
      const { mouseX, mouseY, box } = cropStartRef.current;

      const deltaX = (e.clientX - mouseX) / zoom;
      const deltaY = (e.clientY - mouseY) / zoom;

      let nextX = box.x;
      let nextY = box.y;
      let nextW = box.width;
      let nextH = box.height;

      if (cropDragMode === "move") {
        nextX = Math.max(0, Math.min(box.x + deltaX, imageDims.width - box.width));
        nextY = Math.max(0, Math.min(box.y + deltaY, imageDims.height - box.height));
      } else {
        if (cropDragMode.includes("e")) nextW = Math.max(30, Math.min(box.width + deltaX, imageDims.width - box.x));
        if (cropDragMode.includes("s")) nextH = Math.max(30, Math.min(box.height + deltaY, imageDims.height - box.y));
        if (cropDragMode.includes("w")) {
          const possibleW = Math.max(30, box.width - deltaX);
          nextX = box.x + (box.width - possibleW);
          nextW = possibleW;
        }
        if (cropDragMode.includes("n")) {
          const possibleH = Math.max(30, box.height - deltaY);
          nextY = box.y + (box.height - possibleH);
          nextH = possibleH;
        }

        if (cropAspect) {
          nextH = Math.round(nextW / cropAspect);
        }
      }

      setCropBox({
        x: Math.round(nextX),
        y: Math.round(nextY),
        width: Math.round(nextW),
        height: Math.round(nextH),
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingCrop(false);
      setCropDragMode(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingCrop, cropBox, cropDragMode, zoom, cropAspect, imageDims]);

  // =========================================================================
  // 4. COLOR & FILTER ADJUSTMENTS
  // =========================================================================

  const getFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px)`;
  };

  const applyFiltersPermanently = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.filter = getFilterString();
    tempCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);

    // Reset sliders after baking in
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sepia: 0,
      grayscale: 0,
      hue: 0,
      blur: 0,
    });

    pushToHistory();
    showToast("Filters applied to image ✨");
  };

  // =========================================================================
  // 5. ROTATE & FLIP TRANSFORMS
  // =========================================================================

  const rotateCanvas = (degrees: 90 | -90) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.drawImage(canvas, 0, 0);

    // Swap width and height for 90 deg rotation
    const newWidth = canvas.height;
    const newHeight = canvas.width;
    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    ctx.restore();

    setImageDims({ width: newWidth, height: newHeight });
    pushToHistory();
    showToast(`Rotated ${degrees > 0 ? "90° Clockwise" : "90° Counter-Clockwise"}`);
  };

  const flipCanvas = (axis: "h" | "v") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.drawImage(canvas, 0, 0);

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (axis === "h") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    pushToHistory();
    showToast(`Flipped ${axis === "h" ? "Horizontally" : "Vertically"}`);
  };

  // =========================================================================
  // 6. EXPORT / DOWNLOAD / WALLPAPER
  // =========================================================================

  const downloadImage = async (format: "image/png" | "image/jpeg" | "image/webp") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let exportCanvas = canvas;
    if (format === "image/jpeg" && bgPreview !== "transparent") {
      // Draw background color for JPEG
      exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const expCtx = exportCanvas.getContext("2d");
      if (expCtx) {
        expCtx.fillStyle =
          bgPreview === "white"
            ? "#ffffff"
            : bgPreview === "dark"
            ? "#181818"
            : bgPreview === "red"
            ? "#dc2626"
            : bgPreview === "blue"
            ? "#2563eb"
            : customBgColor;
        expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        expCtx.drawImage(canvas, 0, 0);
      }
    }

    const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    const dataUrl = exportCanvas.toDataURL(format, 0.95);
    const link = document.createElement("a");
    link.download = `edited-${imageName.replace(/\.[^/.]+$/, "")}.${ext}`;
    link.href = dataUrl;
    link.click();
    showToast(`Exported as .${ext.toUpperCase()}`);
    setIsExportMenuOpen(false);
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast("Copied PNG with transparency to clipboard!");
      } else {
        showToast("Clipboard item API not supported on this browser");
      }
    } catch (e) {
      console.warn("Failed to copy image:", e);
      showToast("Could not copy image to clipboard");
    }
    setIsExportMenuOpen(false);
  };

  const setAsDesktopWallpaper = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );
      if (blob) {
        const customBlobId = "radjaos_custom_studio_wallpaper";
        await saveWallpaperBlob(customBlobId, blob, "studio-masterpiece.png");

        const updatedConfig = {
          type: "custom_raw" as const,
          rawBlobId: customBlobId,
          fit: "cover" as const,
          opacity: 100,
          blur: 0,
        };

        window.dispatchEvent(
          new CustomEvent(WALLPAPER_CHANGE_EVENT, { detail: updatedConfig })
        );
        showToast("Applied directly as RadjaOS Desktop Wallpaper! 🌟");
      }
    } catch (e) {
      console.error("Failed to set wallpaper:", e);
      showToast("Failed to set wallpaper");
    }
    setIsExportMenuOpen(false);
  };

  // Reset to original photo
  const resetToOriginal = () => {
    if (originalImageRef.current) {
      loadImage(originalImageRef.current.src, imageName, {
        existingHistoryId: activePhotoIdRef.current || undefined,
      });
      syncActiveCanvasToHistory();
      setFilters({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        sepia: 0,
        grayscale: 0,
        hue: 0,
        blur: 0,
      });
      showToast("Reset to original image");
    }
  };

  // Restore saved localStorage photo history & latest uploaded photo on initial mount
  useEffect(() => {
    if (hasRestoredFromStorageRef.current) return;
    hasRestoredFromStorageRef.current = true;

    try {
      const maxBytes = detectNativeLocalStorageMaxBytes();
      const rawHistory = localStorage.getItem(LS_HISTORY_KEY);
      const savedActiveId = localStorage.getItem(LS_ACTIVE_ID_KEY);

      if (rawHistory) {
        const parsed = JSON.parse(rawHistory) as StudioPhotoHistoryItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const target = parsed.find((item) => item.id === savedActiveId) || parsed[0];
          photoHistoryRef.current = parsed;
          activePhotoIdRef.current = target.id;
          setPhotoHistory(parsed);
          setActivePhotoId(target.id);
          setLsStorageStats({
            usedBytes: getTotalLocalStorageBytes(),
            historyBytes: LS_HISTORY_KEY.length + rawHistory.length,
            maxBytes,
          });
          loadImage(target.dataUrl, target.name, {
            existingHistoryId: target.id,
            originalSrc: target.originalDataUrl || target.dataUrl,
            skipPersist: true,
          });
          return;
        }
      }
      setLsStorageStats({
        usedBytes: getTotalLocalStorageBytes(),
        historyBytes: 0,
        maxBytes,
      });
    } catch (err) {
      console.warn("Could not restore photo history from localStorage:", err);
    }

    // Fallback to default sample image only when no prior upload exists in localStorage
    loadImage(SAMPLE_IMAGES[0].path, "about-me-profile.png");
  }, [loadImage]);

  // Smoothly re-fit canvas zoom when switching between Portrait and Landscape viewports without resetting canvas
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !imageDims.width || !imageDims.height) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const vw = entry.contentRect.width;
        const vh = entry.contentRect.height;
        if (vw > 40 && vh > 40) {
          const scale = Math.min((vw - 48) / imageDims.width, (vh - 48) / imageDims.height, 1);
          setZoom(Number(Math.max(0.1, scale).toFixed(2)));
        }
      }
    });
    ro.observe(vp);
    return () => ro.disconnect();
  }, [imageDims.width, imageDims.height]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="studio-container h-full flex flex-col bg-[#14181f]/95 text-neutral-200 select-none overflow-hidden relative"
    >
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-neutral-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-win-flyout flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── TOP CONTROL BAR ─── */}
      <div className="flex-shrink-0 h-12 border-b border-white/10 bg-neutral-950/80 px-3 flex items-center justify-between gap-2 z-20">
        {/* Left: App title and Image dimension metadata */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-xs font-bold text-white tracking-wide hidden sm:inline">
              {locale === "id" ? "Studio Gambar" : locale === "ja" ? "画像スタジオ" : "Image Studio"}
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-mono">
              AI Ready
            </span>

          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-400 pl-2 border-l border-white/10 font-mono">
            <span className="truncate max-w-[120px]" title={imageName}>
              {imageName}
            </span>
            <span>&bull;</span>
            <span className="text-neutral-300">
              {imageDims.width} × {imageDims.height}
            </span>
          </div>
        </div>

        {/* Center: Main Tool Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab("bg_removal")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "bg_removal"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI BG & Retouch</span>
          </button>

          <button
            onClick={() => setActiveTab("crop")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "crop"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Crop className="w-3.5 h-3.5 text-blue-400" />
            <span>Crop & Frame</span>
          </button>

          <button
            onClick={() => setActiveTab("filters")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "filters"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adjust & Filter</span>
          </button>

          <button
            onClick={() => setActiveTab("transform")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "transform"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Transform</span>
          </button>
        </div>

        {/* Right: Actions, History & Export */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* New / Change Image */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }
            }}
            className="px-2.5 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Upload new image (or select from Copy-n-Paste overlay)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </button>

          <button
            onClick={handlePasteFromClipboard}
            className="px-2.5 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Paste image directly from Clipboard (Ctrl+V)"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {isExportMenuOpen && (
              <div
                className="absolute right-0 top-10 w-52 rounded-xl bg-neutral-900 border border-white/15 p-1.5 shadow-2xl z-50 text-xs text-neutral-200 space-y-1 animate-win-zoom"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Download Formats
                </div>
                <button
                  onClick={() => downloadImage("image/png")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>PNG (Transparent)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Best</span>
                </button>
                <button
                  onClick={() => downloadImage("image/jpeg")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>JPG (Solid BG)</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Compressed</span>
                </button>
                <button
                  onClick={() => downloadImage("image/webp")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>WebP (Modern)</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Small</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  onClick={copyToClipboard}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy to Clipboard</span>
                </button>

                <button
                  onClick={setAsDesktopWallpaper}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Set as Wallpaper</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── TOOL OPTIONS SUB-BAR ─── */}
      <div className="flex-shrink-0 bg-neutral-900/90 border-b border-white/10 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-10">
        {/* SUB-BAR CONTENT PER TAB */}
        {activeTab === "bg_removal" && (
          <div className="flex flex-wrap items-center gap-2.5 w-full justify-between">
            {/* Left AI & Retouch controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRemoveBackgroundAi}
                disabled={isAiProcessing}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                title="AI Neural Segmentation (100% lokal di browser dengan proteksi wajah/rambut)"
              >
                {isAiProcessing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                )}
                <span>{isAiProcessing ? "AI Processing..." : "AI Auto Cutout"}</span>
              </button>

              {/* Model precision selector */}
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value as "isnet_fp16" | "isnet_quint8")}
                disabled={isAiProcessing}
                className="bg-black/50 border border-white/15 text-neutral-200 text-[11px] rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-cyan-400 font-mono"
                title="Pilih Model AI: FP16 (Presisi Tinggi ~44MB, tajam untuk anime & rambut) atau INT8 (Fast 35MB)"
              >
                <option value="isnet_fp16">ISNet FP16 (High Quality)</option>
                <option value="isnet_quint8">ISNet INT8 (Fast 35MB)</option>
              </select>

              {/* Protect Face / Inverted Pose Toggle */}
              <label
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors select-none ${
                  protectSubject
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200 font-medium"
                    : "bg-black/30 border-white/10 text-neutral-400 hover:text-white"
                }`}
                title="Protects inverted/upside-down poses, face details, white hair and teeth from being erased by AI"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <input
                  type="checkbox"
                  checked={protectSubject}
                  onChange={(e) => handleRetuneMask(e.target.checked, fillInnerHoles, edgeFeather)}
                  className="sr-only"
                />
                <span>Protect Face</span>
              </label>

              {/* Fill Inner Holes Toggle */}
              <label
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors select-none ${
                  fillInnerHoles
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-200 font-medium"
                    : "bg-black/30 border-white/10 text-neutral-400 hover:text-white"
                }`}
                title="Fills accidental transparent pinholes inside eyes, teeth or clothing"
              >
                <input
                  type="checkbox"
                  checked={fillInnerHoles}
                  onChange={(e) => handleRetuneMask(protectSubject, e.target.checked, edgeFeather)}
                  className="accent-blue-400 cursor-pointer w-3 h-3"
                />
                <span>Fill Holes</span>
              </label>

              {hasAiMaskCached && (
                <span
                  className="hidden xl:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded select-none"
                  title="Mask AI tersimpan di memori; toggle proteksi atau lubang akan langsung ter-update seketika (0ms)"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI Cached</span>
                </span>
              )}

              {/* Contiguous Border Chroma */}
              <button
                onClick={handleQuickColorKeyRemoval}
                disabled={isAiProcessing}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="Border Flood Chroma: Instantly removes uniform background from outer borders without touching interior"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Border Chroma</span>
              </button>

              <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />

              {/* Retouch Mode Switcher: Magic Wand / Erase / Restore */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => {
                    setBrushMode("wand");
                    showToast("Magic Wand: Tap background to erase ✨");
                  }}
                  className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    brushMode === "wand"
                      ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title="Magic Wand: Click any background spot on canvas to erase that color"
                >
                  <MousePointerClick className="w-3 h-3 text-indigo-400" />
                  <span>Magic Wand (Tap BG)</span>
                </button>
                <button
                  onClick={() => setBrushMode("erase")}
                  className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    brushMode === "erase"
                      ? "bg-rose-500/25 text-rose-300 font-semibold border border-rose-500/30"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title="Erase unwanted background remnants manually"
                >
                  <Eraser className="w-3 h-3 text-rose-400" />
                  <span>Erase Brush</span>
                </button>
                <button
                  onClick={() => setBrushMode("restore")}
                  className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    brushMode === "restore"
                      ? "bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-500/30"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title="Recover and restore original details"
                >
                  <Paintbrush className="w-3 h-3 text-emerald-400" />
                  <span>Restore Detail</span>
                </button>
              </div>

              {/* Mode-Specific Parameter Controls */}
              {brushMode === "wand" ? (
                <div className="flex items-center gap-2 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Tolerance</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={wandTolerance}
                    onChange={(e) => setWandTolerance(Number(e.target.value))}
                    className="w-18 accent-indigo-400 cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-neutral-300 w-5 text-right">
                    {wandTolerance}
                  </span>
                  <label className="flex items-center gap-1 ml-1 text-[10px] text-neutral-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wandContiguous}
                      onChange={(e) => setWandContiguous(e.target.checked)}
                      className="accent-indigo-400 cursor-pointer"
                    />
                    <span>Connected</span>
                  </label>
                </div>
              ) : (
                <>
                  {/* Brush Size Slider */}
                  <div className="flex items-center gap-2 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">Size</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-18 accent-cyan-400 cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-neutral-300 w-6 text-right">
                      {brushSize}px
                    </span>
                  </div>

                  {/* Brush Edge / Hardness Slider */}
                  <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-white/10 hidden md:flex">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">Edge</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={brushHardness}
                      onChange={(e) => setBrushHardness(Number(e.target.value))}
                      className="w-14 accent-cyan-400 cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-neutral-300 w-7 text-right">
                      {Math.round(brushHardness * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Background Canvas Backdrop Preview Selector */}
            <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-white/10 ml-auto">
              <span className="text-[10px] text-neutral-400 uppercase font-mono mr-1">Backdrop</span>
              <button
                onClick={() => setBgPreview("transparent")}
                className={`w-5 h-5 rounded border checkerboard-pattern transition-transform cursor-pointer ${
                  bgPreview === "transparent" ? "ring-2 ring-cyan-400 scale-110" : "border-white/20"
                }`}
                title="Transparent Checkerboard"
              />
              <button
                onClick={() => setBgPreview("white")}
                className={`w-5 h-5 rounded bg-white transition-transform cursor-pointer ${
                  bgPreview === "white" ? "ring-2 ring-cyan-400 scale-110" : "border border-white/20"
                }`}
                title="Pure White Canvas"
              />
              <button
                onClick={() => setBgPreview("dark")}
                className={`w-5 h-5 rounded bg-neutral-900 transition-transform cursor-pointer ${
                  bgPreview === "dark" ? "ring-2 ring-cyan-400 scale-110" : "border border-white/20"
                }`}
                title="Dark Canvas"
              />
              <button
                onClick={() => setBgPreview("red")}
                className={`w-5 h-5 rounded bg-red-600 transition-transform cursor-pointer ${
                  bgPreview === "red" ? "ring-2 ring-cyan-400 scale-110" : "border border-white/20"
                }`}
                title="Passport Red"
              />
              <button
                onClick={() => setBgPreview("blue")}
                className={`w-5 h-5 rounded bg-blue-600 transition-transform cursor-pointer ${
                  bgPreview === "blue" ? "ring-2 ring-cyan-400 scale-110" : "border border-white/20"
                }`}
                title="Passport Blue"
              />
              <label className="relative cursor-pointer" title="Custom Backdrop Color">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => {
                    setCustomBgColor(e.target.value);
                    setBgPreview("custom");
                  }}
                  className="w-5 h-5 rounded border border-white/20 p-0 cursor-pointer bg-transparent"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === "crop" && (
          <div className="flex flex-wrap items-center gap-2 w-full justify-between">
            <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => handleCropAspectChange(null)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  cropAspect === null ? "bg-blue-600 text-white font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Freeform
              </button>
              <button
                onClick={() => handleCropAspectChange(1)}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  cropAspect === 1 ? "bg-blue-600 text-white font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Square className="w-3 h-3" />
                <span>1:1 Square</span>
              </button>
              <button
                onClick={() => handleCropAspectChange(4 / 3)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  cropAspect === 4 / 3 ? "bg-blue-600 text-white font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                4:3 Photo
              </button>
              <button
                onClick={() => handleCropAspectChange(16 / 9)}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  cropAspect === 16 / 9 ? "bg-blue-600 text-white font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>16:9 Landscape</span>
              </button>
              <button
                onClick={() => handleCropAspectChange(9 / 16)}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  cropAspect === 9 / 16 ? "bg-blue-600 text-white font-semibold" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16 Story</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400">
                Box: {cropBox?.width} × {cropBox?.height} px
              </span>
              <button
                onClick={applyCrop}
                className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "filters" && (
          <div className="flex flex-wrap items-center gap-3 w-full justify-between">
            {/* Filter Presets */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
              <span className="text-[10px] text-neutral-400 uppercase font-mono mr-1">Presets</span>
              {FILTER_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setFilters(p)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters({
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    sepia: 0,
                    grayscale: 0,
                    hue: 0,
                    blur: 0,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs border border-white/10 transition-colors cursor-pointer"
              >
                Reset Sliders
              </button>
              <button
                onClick={applyFiltersPermanently}
                className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Bake Filters</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "transform" && (
          <div className="flex flex-wrap items-center gap-2 w-full">
            <button
              onClick={() => rotateCanvas(-90)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Rotate 90° Left</span>
            </button>
            <button
              onClick={() => rotateCanvas(90)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Rotate 90° Right</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={() => flipCanvas("h")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flip Horizontal</span>
            </button>
            <button
              onClick={() => flipCanvas("v")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FlipVertical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flip Vertical</span>
            </button>
            <button
              onClick={resetToOriginal}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors ml-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Original</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── AI STATUS & PROGRESS BANNER ─── */}
      {isAiProcessing && (
        <div className="bg-cyan-950/60 border-b border-cyan-500/30 px-4 py-2 flex flex-col gap-1.5 animate-in fade-in z-20">
          <div className="flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="font-semibold">{aiProgressPhase || "Processing..."}</span>
              {aiStartTime && (
                <span className="text-[10px] text-cyan-400/80 font-mono">
                  ({Math.max(1, Math.round((Date.now() - aiStartTime) / 1000))}s)
                </span>
              )}
            </div>
            <span className="font-mono text-cyan-300 font-bold">
              {aiProgressPercent !== null ? `${aiProgressPercent}%` : "Computing..."}
            </span>
          </div>

          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan-500/20">
            {aiProgressPercent !== null ? (
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                style={{ width: `${aiProgressPercent}%` }}
              />
            ) : (
              <div className="h-full bg-cyan-400 animate-pulse w-full" />
            )}
          </div>
        </div>
      )}

      {/* AI Consent / Initialization Prompt Banner */}
      {!aiConsentGiven && !isAiProcessing && (
        <div className="bg-blue-950/40 border-b border-blue-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2 text-blue-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Local AI Engine (ISNet):</strong> Runs 100% in your browser with Inverted Subject & Face Protection. Requires downloading ~{aiModel === "isnet_fp16" ? "44" : "35"}MB model weights once.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBrushMode("wand");
                showToast("Magic Wand Ready! Tap background on canvas to erase ✨");
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer border border-indigo-500/30"
            >
              <MousePointerClick className="w-3 h-3 text-indigo-400" />
              <span>Use Magic Wand (Instant 0MB)</span>
            </button>
            <button
              onClick={handlePreloadAi}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>Download AI (~{aiModel === "isnet_fp16" ? "44" : "35"}MB)</span>
            </button>
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-xs text-rose-200 flex flex-wrap items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2 max-w-2xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{aiError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setBrushMode("wand");
                setActiveTab("bg_removal");
                setAiError(null);
                showToast("Switched to Magic Wand! Tap background on canvas ✨");
              }}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <MousePointerClick className="w-3 h-3" />
              <span>Use Magic Wand (Instant)</span>
            </button>
            <button
              onClick={() => setAiError(null)}
              className="text-xs text-rose-300 hover:text-white px-2 py-0.5 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* AI Consent / Info Modal */}
      {showConsentModal && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-900 border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Inisialisasi Model AI ISNet</h3>
                  <p className="text-[11px] text-neutral-400">100% In-Browser Local Neural Network</p>
                </div>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Model AI ini akan mendeteksi subjek utama dan menghapus background secara otomatis langsung di perambanmu. Dilengkapi algoritma <strong>Protect Subject & Face</strong> untuk menjaga detail wajah terbalik, rambut anime, dan gigi agar tidak ikut terpotong.
            </p>

            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
              <span className="text-neutral-300 font-medium">Model Precision:</span>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value as "isnet_fp16" | "isnet_quint8")}
                className="bg-neutral-800 border border-white/20 text-cyan-300 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none"
              >
                <option value="isnet_fp16">ISNet FP16 (High Quality ~44MB)</option>
                <option value="isnet_quint8">ISNet INT8 (Fast ~35MB)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong>Punya koneksi lambat atau terblokir CDN?</strong>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Kamu bisa langsung gunakan <strong>Magic Wand</strong> atau <strong>Border Chroma</strong> di toolbar untuk menghapus warna seketika tanpa download!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={startAiRemoval}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Download & Jalankan AI (~{aiModel === "isnet_fp16" ? "44" : "35"}MB)</span>
              </button>
              <button
                onClick={() => {
                  setShowConsentModal(false);
                  setBrushMode("wand");
                  showToast("Magic Wand Ready! Tap background to erase ✨");
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pakai Magic Wand (Instan 0MB)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN WORKSPACE BODY (CANVAS VIEWPORT & SIDE PANEL) ─── */}
      <div className="studio-workspace flex-1 overflow-hidden min-h-0 relative">
        {/* CENTER VIEWPORT (CANVAS) */}
        <div
          ref={viewportRef}
          className="flex-1 relative flex items-center justify-center overflow-auto p-4 md:p-6 bg-black/40 scrollbar-thin min-h-[220px]"
          style={{
            backgroundColor:
              bgPreview === "transparent"
                ? undefined
                : bgPreview === "white"
                ? "#ffffff"
                : bgPreview === "dark"
                ? "#181818"
                : bgPreview === "red"
                ? "#dc2626"
                : bgPreview === "blue"
                ? "#2563eb"
                : customBgColor,
          }}
        >
          {/* Subtle Canvas Container */}
          <div
            className={`relative rounded shadow-2xl transition-all duration-75 ${
              bgPreview === "transparent" ? "checkerboard-pattern" : ""
            }`}
            style={{
              scale: `${zoom}`,
              transformOrigin: "center center",
            }}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Image Studio Canvas: ${imageName} (${imageDims.width} by ${imageDims.height} pixels)`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={() => setCursorPos(null)}
              className={`block max-w-none ${
                activeTab === "bg_removal"
                  ? brushMode === "wand"
                    ? "cursor-crosshair"
                    : "cursor-crosshair touch-none"
                  : activeTab === "crop"
                  ? "cursor-default"
                  : "cursor-default"
              }`}
              style={{
                filter: activeTab === "filters" ? getFilterString() : "none",
                display: showOriginalPeek ? "none" : "block",
              }}
            />

            {/* Original Image Peek Layer */}
            {showOriginalPeek && originalImageRef.current && (
              <img
                src={originalImageRef.current.src}
                alt="Original comparison"
                className="block max-w-none"
                style={{ width: imageDims.width, height: imageDims.height }}
              />
            )}

            {/* CROP OVERLAY BOX */}
            {activeTab === "crop" && cropBox && (
              <div
                className="absolute border-2 border-blue-400 bg-black/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move select-none"
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                }}
                onMouseDown={(e) => handleCropMouseDown(e, "move")}
              >
                {/* Rule of thirds grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* 8 Resize Handles */}
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "nw")}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-nw-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "ne")}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-ne-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "sw")}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-sw-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "se")}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-se-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "n")}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-n-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "s")}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-s-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "w")}
                  className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-w-resize"
                />
                <div
                  onMouseDown={(e) => handleCropMouseDown(e, "e")}
                  className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-sm cursor-e-resize"
                />
              </div>
            )}

            {/* LIVE BRUSH RADIUS CURSOR RING */}
            {activeTab === "bg_removal" && cursorPos && (
              <div
                className="absolute pointer-events-none rounded-full border-2 transition-transform duration-75"
                style={{
                  left: `${cursorPos.x - brushSize}px`,
                  top: `${cursorPos.y - brushSize}px`,
                  width: `${brushSize * 2}px`,
                  height: `${brushSize * 2}px`,
                  borderColor: brushMode === "erase" ? "#f43f5e" : "#10b981",
                  backgroundColor:
                    brushMode === "erase" ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT SIDE PANEL (SLIDERS, RECENT UPLOADS & SAMPLES) */}
        <div className="studio-sidepanel bg-neutral-950/80 p-3 flex flex-col gap-3 shrink-0 overflow-y-auto scrollbar-thin">
          {/* Zoom & View Controls */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Viewport Zoom
            </span>
            <div className="flex items-center justify-between gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setZoom((prev) => Math.max(0.1, Number((prev - 0.1).toFixed(2))))}
                className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs text-neutral-200">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-1.5 py-0.5 rounded text-[10px] text-neutral-400 hover:text-white border border-white/10 cursor-pointer"
                title="Reset to 100%"
              >
                100%
              </button>
            </div>
          </div>

          {/* Compare Original Button */}
          <button
            onMouseDown={() => setShowOriginalPeek(true)}
            onMouseUp={() => setShowOriginalPeek(false)}
            onMouseLeave={() => setShowOriginalPeek(false)}
            onTouchStart={() => setShowOriginalPeek(true)}
            onTouchEnd={() => setShowOriginalPeek(false)}
            className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hold to Peek Original</span>
          </button>

          {/* TAB SPECIFIC CONTROLS IN SIDEBAR */}
          {activeTab === "filters" && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Color Adjustments
              </span>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Brightness</span>
                  <span className="font-mono text-white">{filters.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={filters.brightness}
                  onChange={(e) => setFilters((prev) => ({ ...prev, brightness: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Contrast</span>
                  <span className="font-mono text-white">{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={filters.contrast}
                  onChange={(e) => setFilters((prev) => ({ ...prev, contrast: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Saturation</span>
                  <span className="font-mono text-white">{filters.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => setFilters((prev) => ({ ...prev, saturation: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Grayscale */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Grayscale</span>
                  <span className="font-mono text-white">{filters.grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => setFilters((prev) => ({ ...prev, grayscale: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Sepia */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Sepia</span>
                  <span className="font-mono text-white">{filters.sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.sepia}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sepia: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Hue Rotate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Hue Rotate</span>
                  <span className="font-mono text-white">{filters.hue}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={filters.hue}
                  onChange={(e) => setFilters((prev) => ({ ...prev, hue: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ─── PERSISTENT PHOTO HISTORY & NATIVE BROWSER QUOTA ─── */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">
                  Recent History ({photoHistory.length})
                </span>
              </div>
              {photoHistory.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="text-[10px] text-neutral-500 hover:text-rose-400 flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Clear all saved history in localStorage"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Native Browser localStorage Quota Meter */}
            {(() => {
              const usedPct = Math.min(
                100,
                Math.round((lsStorageStats.usedBytes / Math.max(1, lsStorageStats.maxBytes)) * 100)
              );
              const freeBytes = Math.max(0, lsStorageStats.maxBytes - lsStorageStats.usedBytes);
              const avgPhotoBytes =
                photoHistory.length > 0
                  ? Math.max(
                      60 * 1024,
                      Math.round(lsStorageStats.historyBytes / photoHistory.length)
                    )
                  : 160 * 1024;
              const estMorePhotos = Math.max(0, Math.floor(freeBytes / avgPhotoBytes));

              return (
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      <span>Browser Storage</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {formatStorageSize(lsStorageStats.usedBytes)} / {formatStorageSize(lsStorageStats.maxBytes)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        usedPct > 85
                          ? "bg-amber-400"
                          : "bg-gradient-to-r from-cyan-500 to-blue-500"
                      }`}
                      style={{ width: `${Math.max(2, usedPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                    <span>Free: {formatStorageSize(freeBytes)} ({100 - usedPct}%)</span>
                    <span>~{estMorePhotos} more photos</span>
                  </div>
                </div>
              );
            })()}

            {/* Saved Photo History Cards */}
            {photoHistory.length > 0 ? (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5 scrollbar-thin">
                {photoHistory.map((item) => {
                  const isCurrent = item.id === activePhotoId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryPhoto(item)}
                      className={`group relative flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-cyan-500/15 border-cyan-500/40 shadow-sm"
                          : "bg-white/5 hover:bg-white/10 border-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded bg-black/50 checkerboard-pattern overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white truncate">
                            {item.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-500/25 text-cyan-300 font-mono shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-neutral-400 font-mono flex items-center gap-1.5">
                          <span>
                            {item.width}×{item.height}
                          </span>
                          <span>&bull;</span>
                          <span className="text-cyan-300/90">
                            {formatStorageSize(item.byteSize)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryPhoto(e, item.id)}
                        className="opacity-60 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 transition-all cursor-pointer shrink-0"
                        title="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-neutral-500 italic py-1">
                Uploaded & edited photos will automatically stick here up to native browser capacity.
              </div>
            )}
          </div>

          {/* Sample Preset Images for instant testing */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Sample Photos
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => loadImage(sample.path, `${sample.name.toLowerCase().replace(/\s+/g, "-")}.png`)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                >
                  <div className="w-full h-12 rounded bg-black/50 overflow-hidden mb-1 flex items-center justify-center">
                    <img
                      src={sample.path}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-[10px] font-semibold text-white truncate">{sample.name}</div>
                  <div className="text-[9px] text-neutral-500 truncate">{sample.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="mt-auto p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-neutral-400 space-y-1">
            <div className="flex items-center gap-1 text-cyan-300 font-semibold">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Pro Retouch Tips</span>
            </div>
            <p>1. Click "AI Auto Cutout" to isolate foreground.</p>
            <p>2. Use "Erase Brush" to wipe away stray pixels.</p>
            <p>3. Use "Restore Detail" to paint back hair or clothes.</p>
            <p>4. Export as PNG with transparent background.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
