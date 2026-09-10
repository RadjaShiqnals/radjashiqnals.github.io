import React, { useState, useEffect, useRef } from "react";
import { type Locale, localeNames, t } from "../../../lib/i18n";
import {
  Settings,
  Globe,
  Volume2,
  Sliders,
  Palette,
  ShieldAlert,
  Zap,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Crop,
  RotateCw,
  FlipHorizontal,
  Check,
  HardDrive,
} from "lucide-react";
import { simulateSessionExpiry } from "../../../lib/os-state";
import {
  WALLPAPER_PRESETS,
  type WallpaperConfig,
  getSavedWallpaperConfig,
  saveWallpaperConfig,
} from "../../../lib/wallpaper-state";
import { saveWallpaperBlob, getWallpaperBlob } from "../../../lib/wallpaper-db";
import { WallpaperCropperModal } from "../wallpaper/WallpaperCropperModal";

interface SettingsAppProps {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isMuted: boolean;
  toggleMute: () => void;
  potatoMode: boolean;
  togglePotatoMode: () => void;
  onSimulateExpiry: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  locale,
  setLocale,
  isMuted,
  toggleMute,
  potatoMode,
  togglePotatoMode,
  onSimulateExpiry,
}) => {
  const [stressLevel, setStressLevel] = useState(42);
  const [wallpaperConfig, setWallpaperConfigState] = useState<WallpaperConfig>(() =>
    getSavedWallpaperConfig()
  );
  const [wallpaperPreviewUrl, setWallpaperPreviewUrl] = useState<string>("");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [rawUploadMsg, setRawUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync wallpaper preview URL from config or IndexedDB
  useEffect(() => {
    let active = true;
    const updatePreview = async () => {
      if (wallpaperConfig.type === "preset") {
        const p = WALLPAPER_PRESETS.find((x) => x.id === wallpaperConfig.presetId);
        if (active) setWallpaperPreviewUrl(p?.path || "");
      } else if (wallpaperConfig.type === "url") {
        if (active) setWallpaperPreviewUrl(wallpaperConfig.customUrl || "");
      } else if (wallpaperConfig.type === "custom_raw") {
        const record = await getWallpaperBlob(
          wallpaperConfig.rawBlobId || "user_custom_wallpaper"
        );
        if (record && active) {
          const url = URL.createObjectURL(record.blob);
          setWallpaperPreviewUrl(url);
        }
      } else {
        if (active) setWallpaperPreviewUrl("");
      }
    };
    updatePreview();
    return () => {
      active = false;
    };
  }, [wallpaperConfig]);

  const updateConfig = (newConfig: WallpaperConfig) => {
    setWallpaperConfigState(newConfig);
    saveWallpaperConfig(newConfig);
  };

  const handleSelectPreset = (presetId: string) => {
    updateConfig({
      ...wallpaperConfig,
      type: presetId === "mesh" ? "mesh" : "preset",
      presetId,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setRawUploadMsg(`Saving RAW image (${sizeMb} MB) to IndexedDB...`);

    try {
      const blobId = "user_custom_wallpaper";
      await saveWallpaperBlob(blobId, file, file.name);
      setRawUploadMsg(`✓ RAW image saved to device IndexedDB (${sizeMb} MB)!`);

      updateConfig({
        ...wallpaperConfig,
        type: "custom_raw",
        rawBlobId: blobId,
      });
    } catch (err) {
      console.error(err);
      setRawUploadMsg("Failed to store RAW image in IndexedDB");
    }
  };

  const handleApplyUrl = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    updateConfig({
      ...wallpaperConfig,
      type: "url",
      customUrl: customUrlInput.trim(),
    });
  };

  const rotateWallpaper = () => {
    updateConfig({
      ...wallpaperConfig,
      rotation: ((wallpaperConfig.rotation || 0) + 90) % 360,
    });
  };

  const toggleFlip = () => {
    updateConfig({
      ...wallpaperConfig,
      flipH: !wallpaperConfig.flipH,
    });
  };

  const getStressVerdict = (level: number) => {
    if (level < 25) return t("settings.stress.zen", locale);
    if (level < 50) return t("settings.stress.normal", locale);
    if (level < 75) return t("settings.stress.overdrive", locale);
    return t("settings.stress.panic", locale);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="space-y-1 pb-2 border-b border-white/10">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <span>{t("settings.title", locale)}</span>
        </h2>
      </div>

      {/* Language Section */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Globe className="w-4 h-4 text-blue-400" />
          <span>{t("settings.language", locale)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(localeNames) as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                locale === l
                  ? "bg-blue-600/30 border-blue-500 text-white font-bold"
                  : "bg-neutral-900/60 border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span className="text-lg">{localeNames[l].flag}</span>
              <span>{localeNames[l].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Potato / Eco Performance Mode Section */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Zap className={`w-4 h-4 ${potatoMode ? "text-amber-400" : "text-neutral-400"}`} />
            <span>{t("settings.potatoMode", locale)}</span>
          </div>
          <button
            onClick={togglePotatoMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              potatoMode
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10"
                : "bg-neutral-800 border-white/10 text-neutral-400 hover:text-white"
            }`}
          >
            {potatoMode ? "Active (Potato ON 🥔)" : "Off (Full Blur)"}
          </button>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          {t("settings.potatoDesc", locale)}
        </p>
      </div>

      {/* Desktop Wallpaper & Cropper Section */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <span>{t("settings.wallpaper", locale)}</span>
            </div>
            {wallpaperPreviewUrl && (
              <button
                onClick={() => setIsCropperOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>{t("settings.wallpaperCrop", locale)}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {t("settings.wallpaperDesc", locale)}
          </p>
        </div>

        {/* Wallpaper Presets Horizontal Grid */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-neutral-300">Preset Wallpapers</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {WALLPAPER_PRESETS.map((preset) => {
              const isSelected =
                wallpaperConfig.type === "preset" && wallpaperConfig.presetId === preset.id;
              const isMeshSelected =
                wallpaperConfig.type === "mesh" && preset.id === "mesh";
              const active = isSelected || isMeshSelected;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all p-1 flex flex-col justify-between cursor-pointer ${
                    active
                      ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/20"
                      : "border-white/10 hover:border-white/30 bg-neutral-900/60"
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-neutral-950 flex items-center justify-center relative">
                    {preset.path ? (
                      <img
                        src={preset.path}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-blue-950 flex items-center justify-center">
                        <span className="text-[10px] text-neutral-500 font-mono">Mesh</span>
                      </div>
                    )}
                    {active && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300 truncate pt-1 px-1">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom RAW Upload & URL Box */}
        <div className="p-3 rounded-xl bg-neutral-900/70 border border-white/5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t("settings.wallpaperUpload", locale)}</span>
              </span>
              <p className="text-[10px] text-neutral-400">
                {t("settings.wallpaperUploadHint", locale)}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File 4K/8K</span>
            </button>
          </div>

          {rawUploadMsg && (
            <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
              {rawUploadMsg}
            </p>
          )}

          {/* Custom URL Form */}
          <form onSubmit={handleApplyUrl} className="flex items-center gap-2 pt-1 border-t border-white/5">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              {t("settings.wallpaperApplyUrl", locale)}
            </button>
          </form>
        </div>

        {/* Live Wallpaper Layout & Visual Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Fit Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-medium">
              {t("settings.wallpaperFit", locale)}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-xl border border-white/5 text-xs">
              {(["cover", "contain", "fill"] as const).map((fitMode) => (
                <button
                  key={fitMode}
                  onClick={() => updateConfig({ ...wallpaperConfig, fit: fitMode })}
                  className={`py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    wallpaperConfig.fit === fitMode
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {fitMode}
                </button>
              ))}
            </div>
          </div>

          {/* Transform shortcuts */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-medium">Transform</label>
            <div className="flex items-center gap-2">
              <button
                onClick={rotateWallpaper}
                className="flex-1 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Rotate ({wallpaperConfig.rotation || 0}°)</span>
              </button>
              <button
                onClick={toggleFlip}
                className={`flex-1 py-1.5 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  wallpaperConfig.flipH
                    ? "bg-blue-600/30 border-blue-500/50 text-blue-300"
                    : "bg-neutral-900 hover:bg-neutral-800 border-white/10 text-neutral-300"
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Mirror</span>
              </button>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">{t("settings.wallpaperOpacity", locale)}</span>
              <span className="font-mono text-white">{wallpaperConfig.opacity || 85}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={wallpaperConfig.opacity || 85}
              onChange={(e) =>
                updateConfig({
                  ...wallpaperConfig,
                  opacity: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Blur Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">{t("settings.wallpaperBlur", locale)}</span>
              <span className="font-mono text-white">{wallpaperConfig.blur || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={wallpaperConfig.blur || 0}
              onChange={(e) =>
                updateConfig({
                  ...wallpaperConfig,
                  blur: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Audio Section */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>{t("settings.sound", locale)}</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Synthesized audio via Web Audio API (0 KB external files).
          </p>
        </div>
        <button
          onClick={toggleMute}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            isMuted
              ? "bg-neutral-800 border-white/10 text-neutral-400"
              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {isMuted ? "Off (Muted)" : "On (Active)"}
        </button>
      </div>

      {/* Developer Stress Slider */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-white">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>{t("settings.stress", locale)}</span>
          </div>
          <span className="font-mono text-amber-400 font-bold">{stressLevel}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={stressLevel}
          onChange={(e) => setStressLevel(parseInt(e.target.value, 10))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <p className="text-[11px] text-neutral-400 italic">
          "{getStressVerdict(stressLevel)}"
        </p>
      </div>

      {/* Themes (Work in progress) */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-white">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>{t("settings.theme", locale)}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Phase 3
          </span>
        </div>
        <p className="text-xs text-neutral-400">{t("settings.themeWip", locale)}</p>
        <div className="grid grid-cols-3 gap-2 pt-1 opacity-60 pointer-events-none">
          <div className="p-2 rounded-lg border border-white/10 text-center text-xs text-neutral-400 bg-neutral-900">
            Obsidian (Active)
          </div>
          <div className="p-2 rounded-lg border border-pink-500/20 text-center text-xs text-pink-400/80 bg-neutral-900">
            Mommy ASMR (WIP)
          </div>
          <div className="p-2 rounded-lg border border-red-500/20 text-center text-xs text-red-400/80 bg-neutral-900">
            Persona (WIP)
          </div>
        </div>
      </div>

      {/* 7-Day Expiry Satire Test */}
      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
          <ShieldAlert className="w-4 h-4" />
          <span>{t("settings.testSessionExpiry", locale)}</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Test the satire 7-day security expiry behavior immediately without waiting for 7 days.
        </p>
        <button
          onClick={() => {
            simulateSessionExpiry();
            onSimulateExpiry();
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
        >
          {t("settings.testSessionBtn", locale)}
        </button>
      </div>

      {/* Interactive Cropper Modal */}
      {isCropperOpen && wallpaperPreviewUrl && (
        <WallpaperCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={wallpaperPreviewUrl}
          config={wallpaperConfig}
          onApply={(updated) => updateConfig(updated)}
        />
      )}
    </div>
  );
};
