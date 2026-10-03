export interface WallpaperPreset {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
  accentColor: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "radja-dark",
    name: "RadjaOS Obsidian Waves (Default)",
    path: "/image/wallpaper/radja-dark.jpg",
    thumbnail: "/image/wallpaper/radja-dark.jpg",
    accentColor: "#60cdff",
  },
  {
    id: "radja-light",
    name: "RadjaOS Radiant Waves (Light)",
    path: "/image/wallpaper/radja-light.jpg",
    thumbnail: "/image/wallpaper/radja-light.jpg",
    accentColor: "#0078d4",
  },
  {
    id: "catppuccin",
    name: "Catppuccin Pastel",
    path: "/image/wallpaper/catpuccin-wallpaper.png",
    thumbnail: "/image/wallpaper/catpuccin-wallpaper.png",
    accentColor: "#f5c2e7",
  },
  {
    id: "horimiya",
    name: "Horimiya Anime",
    path: "/image/wallpaper/horimiya-two.png",
    thumbnail: "/image/wallpaper/horimiya-two.png",
    accentColor: "#89b4fa",
  },
  {
    id: "sadboy",
    name: "Sadboy Lofi Dark",
    path: "/image/wallpaper/sadboy.png",
    thumbnail: "/image/wallpaper/sadboy.png",
    accentColor: "#9399b2",
  },
  {
    id: "kurumi",
    name: "Tokisaki Kurumi Gothic",
    path: "/image/wallpaper/tokisaki-kurumi-dark-left.jpg",
    thumbnail: "/image/wallpaper/tokisaki-kurumi-dark-left.jpg",
    accentColor: "#f38ba8",
  },
  {
    id: "mesh",
    name: "Dark Minimalist Mesh",
    path: "",
    thumbnail: "",
    accentColor: "#3b82f6",
  },
];

export interface WallpaperConfig {
  type: "preset" | "url" | "custom_raw" | "mesh";
  presetId: string;
  customUrl?: string;
  rawBlobId?: string; // id in IndexedDB
  fit: "cover" | "contain" | "fill";
  opacity: number; // 20 - 100 (%)
  blur: number; // 0 - 20 (px)
  flipH: boolean;
  flipV: boolean;
  rotation: number; // 0, 90, 180, 270
}

export const DEFAULT_WALLPAPER_CONFIG: WallpaperConfig = {
  type: "preset",
  presetId: "radja-dark",
  fit: "cover",
  opacity: 100,
  blur: 0,
  flipH: false,
  flipV: false,
  rotation: 0,
};

const STORAGE_KEY = "radjaos_wallpaper_config";
export const WALLPAPER_CHANGE_EVENT = "radjaos_wallpaper_change";

export function getSavedWallpaperConfig(): WallpaperConfig {
  if (typeof window === "undefined") return DEFAULT_WALLPAPER_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WALLPAPER_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed.presetId === "win11-dark") parsed.presetId = "radja-dark";
    if (parsed.presetId === "win11-light") parsed.presetId = "radja-light";
    return { ...DEFAULT_WALLPAPER_CONFIG, ...parsed };
  } catch {
    return DEFAULT_WALLPAPER_CONFIG;
  }
}

export function saveWallpaperConfig(config: WallpaperConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(WALLPAPER_CHANGE_EVENT, { detail: config }));
  } catch (err) {
    console.error("Failed to save wallpaper config:", err);
  }
}
