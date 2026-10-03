import React, { useState, useEffect, useRef } from "react";
import { type AppId } from "../../lib/os-state";
import { type Locale, type TranslationKey, localeNames, t } from "../../lib/i18n";
import {
  Volume2,
  VolumeX,
  Wifi,
  BatteryCharging,
  ChevronUp,
  Search,
  Power,
  RotateCw,
  Lock,
  Zap,
  Sliders,
  Bell,
  Sparkles,
} from "lucide-react";
import { playWindowOpen } from "../../lib/sound";

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface TaskbarProps {
  openWindows: Record<AppId, boolean>;
  minimizedWindows: Record<AppId, boolean>;
  activeWindowId: AppId | null;
  onOpenApp: (id: AppId) => void;
  onMinimizeApp: (id: AppId) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  isMuted: boolean;
  toggleMute: () => void;
  potatoMode: boolean;
  togglePotatoMode: () => void;
  onLockScreen: () => void;
  onTriggerBSOD: () => void;
  onToggleShowDesktop: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  openWindows,
  minimizedWindows,
  activeWindowId,
  onOpenApp,
  onMinimizeApp,
  locale,
  setLocale,
  isMuted,
  toggleMute,
  potatoMode,
  togglePotatoMode,
  onLockScreen,
  onTriggerBSOD,
  onToggleShowDesktop,
}) => {
  // Flyout visibility states
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);

  // Search input in Start Menu
  const [searchQuery, setSearchQuery] = useState("");

  // Clock state
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Volume & Brightness sliders for Quick Settings
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [brightnessLevel, setBrightnessLevel] = useState(100);

  const startMenuRef = useRef<HTMLDivElement>(null);
  const quickSettingsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Time & Date updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close flyouts on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isStartOpen &&
        startMenuRef.current &&
        !startMenuRef.current.contains(target) &&
        !target.closest("[data-start-btn]")
      ) {
        setIsStartOpen(false);
        setIsPowerMenuOpen(false);
      }
      if (
        isQuickSettingsOpen &&
        quickSettingsRef.current &&
        !quickSettingsRef.current.contains(target) &&
        !target.closest("[data-quicksettings-btn]")
      ) {
        setIsQuickSettingsOpen(false);
      }
      if (
        isCalendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        !target.closest("[data-calendar-btn]")
      ) {
        setIsCalendarOpen(false);
      }
      if (
        isLangMenuOpen &&
        langMenuRef.current &&
        !langMenuRef.current.contains(target) &&
        !target.closest("[data-lang-btn]")
      ) {
        setIsLangMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handleClickOutside);
    return () => window.removeEventListener("pointerdown", handleClickOutside);
  }, [isStartOpen, isQuickSettingsOpen, isCalendarOpen, isLangMenuOpen]);

  const taskbarApps: { id: AppId; nameKey: TranslationKey; iconSrc: string }[] = [
    { id: "about", nameKey: "app.about", iconSrc: "/image/win11/thispc.png" },
    { id: "projects", nameKey: "app.projects", iconSrc: "/image/win11/explorer.png" },
    { id: "skills", nameKey: "app.skills", iconSrc: "/image/win11/vscode.png" },
    { id: "experience", nameKey: "app.experience", iconSrc: "/image/win11/experience.png" },
    { id: "terminal", nameKey: "app.terminal", iconSrc: "/image/win11/terminal.png" },
    { id: "tools", nameKey: "app.tools", iconSrc: "/image/win11/taskmanager.png" },
    { id: "settings", nameKey: "app.settings", iconSrc: "/image/win11/settings.png" },
    { id: "trash", nameKey: "app.trash", iconSrc: "/image/win11/bin0.png" },
  ];

  const handleTaskbarItemClick = (id: AppId) => {
    if (openWindows[id]) {
      if (activeWindowId === id) {
        // Active window clicked: minimize it
        onMinimizeApp(id);
      } else {
        // Open window clicked: focus and bring to front
        onOpenApp(id);
      }
    } else {
      // Not open: open it
      onOpenApp(id);
    }
  };

  const filteredApps = taskbarApps.filter((app) =>
    t(app.nameKey, locale).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* ======================================================== */}
      {/* 1. RADJAOS START MENU FLYOUT                          */}
      {/* ======================================================== */}
      {isStartOpen && (
        <div
          ref={startMenuRef}
          className="fixed bottom-14 inset-x-0 mx-auto w-[560px] max-w-[94vw] h-[520px] max-h-[calc(100vh-70px)] rounded-2xl acrylic-surface z-50 flex flex-col justify-between overflow-hidden shadow-2xl animate-win-flyout text-white select-none border border-white/10"
        >
          {/* Top Search Bar */}
          <div className="p-4 sm:p-5 pb-2 sm:pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type here to search apps, settings, and documents"
                autoFocus
                className="w-full h-10 pl-10 pr-4 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Start Menu Main Body: Pinned & Recommended */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-7 space-y-5 sm:space-y-6">
            {/* Pinned Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white tracking-wide">Pinned</span>
                <span className="text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/5 cursor-pointer">
                  All apps &gt;
                </span>
              </div>

              {/* Pinned Apps Grid (6 columns) */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-3 gap-x-2">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      onOpenApp(app.id);
                      setIsStartOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
                  >
                    <img
                      src={app.iconSrc}
                      alt={t(app.nameKey, locale)}
                      className="w-8 h-8 object-contain drop-shadow group-hover:scale-105 transition-transform"
                    />
                    <span className="mt-1.5 text-[11px] text-neutral-200 group-hover:text-white text-center truncate max-w-full">
                      {t(app.nameKey, locale)}
                    </span>
                  </button>
                ))}

                {/* External Links pinned inside Start Menu */}
                <a
                  href="https://github.com/radjashiqnals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <span className="mt-1.5 text-[11px] text-neutral-200 group-hover:text-white text-center truncate max-w-full">
                    GitHub
                  </span>
                </a>

                <a
                  href="https://linkedin.com/in/radjashiqnals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0077b5] flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <span className="mt-1.5 text-[11px] text-neutral-200 group-hover:text-white text-center truncate max-w-full">
                    LinkedIn
                  </span>
                </a>
              </div>
            </div>

            {/* Recommended Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white tracking-wide">Recommended</span>
                <span className="text-[11px] text-neutral-400">Recent activity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  onClick={() => {
                    onOpenApp("projects");
                    setIsStartOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img src="/image/win11/explorer.png" className="w-7 h-7 object-contain" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">MommyScript Transpiler</p>
                    <p className="text-[10px] text-neutral-400">Featured Core Project</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    onOpenApp("experience");
                    setIsStartOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img src="/image/win11/experience.png" className="w-7 h-7 object-contain" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">SIDIGS Tech Lead</p>
                    <p className="text-[10px] text-neutral-400">East Java School Ecosystem</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    onOpenApp("about");
                    setIsStartOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img src="/image/win11/thispc.png" className="w-7 h-7 object-contain" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">Radja Genta Profile.md</p>
                    <p className="text-[10px] text-neutral-400">Resume & Background</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    onOpenApp("terminal");
                    setIsStartOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img src="/image/win11/terminal.png" className="w-7 h-7 object-contain" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">RadjaShell / SysInfo</p>
                    <p className="text-[10px] text-neutral-400">CLI Simulator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Profile & Power Footer */}
          <div className="h-16 bg-black/40 border-t border-white/10 px-4 sm:px-8 flex items-center justify-between relative">
            {/* User Profile Info */}
            <div
              onClick={() => {
                onOpenApp("about");
                setIsStartOpen(false);
              }}
              className="flex items-center gap-3 p-1.5 -ml-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-neutral-800">
                <img
                  src="/image/about-me-profile.png"
                  alt="Radja Genta"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Radja Genta Saputra</p>
                <p className="text-[10px] text-neutral-400">{t("sys.role", locale)}</p>
              </div>
            </div>

            {/* Power Button with Flyout */}
            <div className="relative">
              <button
                onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
                className="w-9 h-9 rounded-lg hover:bg-white/10 active:bg-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Power options"
              >
                <Power className="w-4 h-4" />
              </button>

              {isPowerMenuOpen && (
                <div className="absolute right-0 bottom-12 w-44 rounded-xl acrylic-surface p-1.5 shadow-2xl border border-white/10 space-y-1 z-50 animate-win-zoom">
                  <button
                    onClick={() => {
                      setIsPowerMenuOpen(false);
                      setIsStartOpen(false);
                      onLockScreen();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t("sys.lock", locale)}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPowerMenuOpen(false);
                      setIsStartOpen(false);
                      onTriggerBSOD();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Crash / BSOD (Easter egg)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPowerMenuOpen(false);
                      setIsStartOpen(false);
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restart RadjaOS</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RADJAOS QUICK SETTINGS / ACTION CENTER FLYOUT       */}
      {/* ======================================================== */}
      {isQuickSettingsOpen && (
        <div
          ref={quickSettingsRef}
          className="fixed bottom-14 right-3 w-[360px] max-w-[95vw] rounded-2xl acrylic-surface p-4 z-50 shadow-2xl animate-win-flyout text-white select-none border border-white/10 space-y-4"
        >
          {/* Quick Action Toggles (Grid) */}
          <div className="grid grid-cols-3 gap-2">
            {/* WiFi Toggle */}
            <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600 text-white font-medium text-xs gap-1.5 shadow">
              <Wifi className="w-4 h-4" />
              <span className="text-[11px]">Radja Fiber</span>
            </button>

            {/* Mute Audio Toggle */}
            <button
              onClick={toggleMute}
              className={`flex flex-col items-center justify-center p-3 rounded-xl font-medium text-xs gap-1.5 transition-colors cursor-pointer ${
                !isMuted
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 hover:bg-white/10 text-neutral-400"
              }`}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px]">{!isMuted ? "Audio ON" : "Muted"}</span>
            </button>

            {/* Eco / Potato Mode Toggle */}
            <button
              onClick={togglePotatoMode}
              className={`flex flex-col items-center justify-center p-3 rounded-xl font-medium text-xs gap-1.5 transition-colors cursor-pointer ${
                potatoMode
                  ? "bg-amber-600 text-white shadow-amber-500/20 shadow"
                  : "bg-white/5 hover:bg-white/10 text-neutral-400"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="text-[11px]">{potatoMode ? "Eco (Potato)" : "Glass GPU"}</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="text-neutral-300 hover:text-white cursor-pointer">
                {isMuted || volumeLevel === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volumeLevel}
                onChange={(e) => {
                  setVolumeLevel(parseInt(e.target.value, 10));
                  if (isMuted) toggleMute();
                }}
                className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-full"
              />
              <span className="font-mono text-xs text-neutral-400 w-8 text-right">
                {isMuted ? 0 : volumeLevel}%
              </span>
            </div>
          </div>

          {/* Brightness Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <input
                type="range"
                min="20"
                max="100"
                value={brightnessLevel}
                onChange={(e) => setBrightnessLevel(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-full"
              />
              <span className="font-mono text-xs text-neutral-400 w-8 text-right">
                {brightnessLevel}%
              </span>
            </div>
          </div>

          {/* Battery Status bar */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span>100% (Plugged in • Kopi SWAG Powered)</span>
            </div>
            <button
              onClick={() => {
                onOpenApp("settings");
                setIsQuickSettingsOpen(false);
              }}
              className="p-1.5 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="All Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. RADJAOS CALENDAR & NOTIFICATION FLYOUT              */}
      {/* ======================================================== */}
      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="fixed bottom-14 right-3 w-[340px] max-w-[95vw] rounded-2xl acrylic-surface p-5 z-50 shadow-2xl animate-win-flyout text-white select-none border border-white/10 space-y-4"
        >
          {/* Header Date & Day */}
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p className="text-2xl font-light text-neutral-200 mt-1">{currentTime}</p>
          </div>

          {/* Simple Mini Calendar Display */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-400 font-medium">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate();
                return (
                  <div
                    key={day}
                    className={`h-7 flex items-center justify-center rounded-full text-xs transition-colors ${
                      isToday
                        ? "bg-blue-600 text-white font-bold ring-2 ring-blue-400/40"
                        : "text-neutral-300 hover:bg-white/10 cursor-pointer"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focus session notification */}
          <div className="pt-2 border-t border-white/10 text-[11px] text-neutral-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span>No unread notifications</span>
            </div>
            <span className="font-mono text-neutral-500">Focus: ON</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. LANGUAGE SWITCHER POPUP                                */}
      {/* ======================================================== */}
      {isLangMenuOpen && (
        <div
          ref={langMenuRef}
          className="fixed bottom-14 right-28 w-44 rounded-xl acrylic-surface p-1.5 z-50 shadow-2xl animate-win-zoom text-white border border-white/10 space-y-1 select-none"
        >
          {(Object.keys(localeNames) as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setIsLangMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                locale === loc
                  ? "bg-blue-600/30 text-white font-bold border border-blue-500/40"
                  : "hover:bg-white/10 text-neutral-300 hover:text-white"
              }`}
            >
              <span>{localeNames[loc].label}</span>
              <span className="text-base">{localeNames[loc].flag}</span>
            </button>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MAIN RADJAOS TASKBAR CONTAINER (FIXED BOTTOM 48PX)  */}
      {/* ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-[#1c1c1c]/80 backdrop-blur-3xl border-t border-white/10 z-40 flex items-center justify-between px-2 sm:px-3 select-none">
        {/* Left: Weather / Widget placeholder (or small brand) */}
        <div className="hidden lg:flex items-center gap-2 pl-1 min-w-[120px]">
          <button
            onClick={() => {
              playWindowOpen();
              setIsStartOpen(!isStartOpen);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-xs text-neutral-300 hover:text-white cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-medium tracking-wide">RadjaOS</span>
          </button>
        </div>

        {/* Center: Iconic Centered Dock Launcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 mx-auto shrink-0">
          {/* Start Button */}
          <button
            data-start-btn
            onClick={() => {
              playWindowOpen();
              setIsStartOpen(!isStartOpen);
              setIsQuickSettingsOpen(false);
              setIsCalendarOpen(false);
            }}
            className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center transition-all cursor-pointer ${
              isStartOpen ? "bg-white/15" : "hover:bg-white/10 active:scale-95"
            }`}
            title="Start"
          >
            {/* RadjaOS Distinctive 4-Tile Brand Badge */}
            <svg
              viewBox="0 0 88 88"
              className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform drop-shadow"
            >
              <rect x="2" y="2" width="38" height="38" rx="7" fill="#0078d4" />
              <rect x="48" y="2" width="38" height="38" rx="7" fill="#60cdff" />
              <rect x="2" y="48" width="38" height="38" rx="7" fill="#005a9e" />
              <rect x="48" y="48" width="38" height="38" rx="7" fill="#0078d4" />
            </svg>
          </button>

          {/* Search Button */}
          <button
            onClick={() => {
              playWindowOpen();
              setIsStartOpen(true);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-neutral-300 hover:text-white cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Taskbar App Icons: On mobile show only open/active apps; on desktop show all pinned */}
          {taskbarApps.map((app) => {
            const isOpen = openWindows[app.id];
            const isMin = minimizedWindows[app.id];
            const isActive = activeWindowId === app.id && !isMin;

            return (
              <button
                key={app.id}
                onClick={() => handleTaskbarItemClick(app.id)}
                className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-md items-center justify-center transition-all cursor-pointer ${
                  isOpen ? "flex" : "hidden md:flex"
                } ${
                  isActive
                    ? "bg-white/10"
                    : isOpen
                    ? "hover:bg-white/10"
                    : "hover:bg-white/5 active:scale-95"
                }`}
                title={t(app.nameKey, locale)}
              >
                {/* App Icon */}
                <img
                  src={app.iconSrc}
                  alt={t(app.nameKey, locale)}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-105 transition-transform"
                />

                {/* RadjaOS Running App Indicator Pill */}
                {isOpen && (
                  <span
                    className={`absolute bottom-0.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? "w-3.5 sm:w-4 h-[3px] bg-[#60cdff] group-hover:w-5"
                        : "w-1.5 h-[3px] bg-neutral-400 group-hover:w-3"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: System Tray & Clocks */}
        <div className="flex items-center gap-0.5 sm:gap-1 pr-1 shrink-0">
          {/* Chevron overflow */}
          <button
            onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
            className="hidden sm:flex w-7 h-8 rounded-md items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="System tray overflow"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Language Switcher Pill */}
          <button
            data-lang-btn
            onClick={() => {
              setIsLangMenuOpen(!isLangMenuOpen);
              setIsQuickSettingsOpen(false);
              setIsCalendarOpen(false);
            }}
            className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors uppercase font-mono cursor-pointer"
            title="Language"
          >
            {locale}
          </button>

          {/* Unified Quick Settings Pill (WiFi + Volume + Battery) */}
          <button
            data-quicksettings-btn
            onClick={() => {
              playWindowOpen();
              setIsQuickSettingsOpen(!isQuickSettingsOpen);
              setIsStartOpen(false);
              setIsCalendarOpen(false);
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
              isQuickSettingsOpen ? "bg-white/10" : ""
            }`}
            title="Network, Sound, and Battery settings"
          >
            <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300" />
            {isMuted ? (
              <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500" />
            ) : (
              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300" />
            )}
            <BatteryCharging className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
          </button>

          {/* Stacked Clock & Date Pill */}
          <button
            data-calendar-btn
            onClick={() => {
              playWindowOpen();
              setIsCalendarOpen(!isCalendarOpen);
              setIsStartOpen(false);
              setIsQuickSettingsOpen(false);
            }}
            className={`flex flex-col items-end px-1.5 py-0.5 sm:px-2 rounded-md text-right hover:bg-white/10 transition-colors cursor-pointer ${
              isCalendarOpen ? "bg-white/10" : ""
            }`}
            title="Calendar & Notifications"
          >
            <span className="text-[11px] font-normal text-neutral-200 tracking-tight leading-none">
              {currentTime}
            </span>
            <span className="hidden sm:inline text-[10px] text-neutral-400 leading-tight mt-0.5">
              {currentDate}
            </span>
          </button>

          {/* RadjaOS Show Desktop Strip (Extreme right edge) */}
          <button
            onClick={onToggleShowDesktop}
            className="hidden sm:block w-1.5 hover:w-2 h-7 border-l border-white/15 hover:bg-white/20 transition-all ml-1 cursor-pointer"
            title="Show desktop"
          />
        </div>
      </footer>
    </>
  );
};
