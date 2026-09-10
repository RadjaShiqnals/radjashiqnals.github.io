import React, { useState, useEffect } from "react";
import {
  type AppId,
  checkSessionValid,
  createSession,
  clearSession,
  getPotatoMode,
  setPotatoModeState,
} from "../../lib/os-state";
import { type Locale, getSavedLocale, saveLocale, t } from "../../lib/i18n";
import { getMuteState, setMuteState, playWindowOpen, playWindowClose } from "../../lib/sound";
import {
  WALLPAPER_PRESETS,
  type WallpaperConfig,
  getSavedWallpaperConfig,
  WALLPAPER_CHANGE_EVENT,
} from "../../lib/wallpaper-state";
import { getWallpaperBlob } from "../../lib/wallpaper-db";
import { TopBar } from "./TopBar";
import { Dock } from "./Dock";
import { DesktopIcon } from "./DesktopIcon";
import { WindowFrame } from "./WindowFrame";
import { LoginScreen } from "./LoginScreen";

// Apps
import { AboutApp } from "./apps/AboutApp";
import { ProjectsApp } from "./apps/ProjectsApp";
import { SkillsApp } from "./apps/SkillsApp";
import { ExperienceApp } from "./apps/ExperienceApp";
import { TerminalApp } from "./apps/TerminalApp";
import { TrashApp } from "./apps/TrashApp";
import { SettingsApp } from "./apps/SettingsApp";

// Icons
import { User, FolderGit2, Cpu, Briefcase, Terminal, Trash2, Settings } from "lucide-react";

export const DesktopEnv: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expiredNotice, setExpiredNotice] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBSOD, setIsBSOD] = useState(false);
  const [potatoMode, setPotatoMode] = useState(false);

  // Wallpaper States
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig>(() =>
    getSavedWallpaperConfig()
  );
  const [wallpaperUrl, setWallpaperUrl] = useState<string>("");

  // Window Management States
  const [openWindows, setOpenWindows] = useState<Record<AppId, boolean>>({
    about: true, // Default open on login
    projects: false,
    skills: false,
    experience: false,
    terminal: false,
    trash: false,
    settings: false,
  });

  const [minimizedWindows, setMinimizedWindows] = useState<Record<AppId, boolean>>({
    about: false,
    projects: false,
    skills: false,
    experience: false,
    terminal: false,
    trash: false,
    settings: false,
  });

  const [maximizedWindows, setMaximizedWindows] = useState<Record<AppId, boolean>>({
    about: false,
    projects: false,
    skills: false,
    experience: false,
    terminal: false,
    trash: false,
    settings: false,
  });

  const [windowZIndices, setWindowZIndices] = useState<Record<AppId, number>>({
    about: 10,
    projects: 1,
    skills: 1,
    experience: 1,
    terminal: 1,
    trash: 1,
    settings: 1,
  });

  const [activeWindowId, setActiveWindowId] = useState<AppId | null>("about");
  const [topZ, setTopZ] = useState(15);

  // Initialize Session, Audio, and Responsiveness
  useEffect(() => {
    setLocaleState(getSavedLocale());
    setIsMuted(getMuteState());
    setPotatoMode(getPotatoMode());

    const session = checkSessionValid();
    if (session.valid) {
      setIsLoggedIn(true);
    } else if (session.expired) {
      setExpiredNotice(true);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Resolve and update dynamic wallpaper
  useEffect(() => {
    let active = true;
    let currentBlobUrl = "";

    const resolveWallpaper = async (cfg: WallpaperConfig) => {
      if (cfg.type === "preset") {
        const p =
          WALLPAPER_PRESETS.find((x) => x.id === cfg.presetId) ||
          WALLPAPER_PRESETS[0];
        if (active) setWallpaperUrl(p?.path || "");
      } else if (cfg.type === "url") {
        if (active) setWallpaperUrl(cfg.customUrl || "");
      } else if (cfg.type === "custom_raw") {
        const record = await getWallpaperBlob(
          cfg.rawBlobId || "user_custom_wallpaper"
        );
        if (record && active) {
          if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
          currentBlobUrl = URL.createObjectURL(record.blob);
          setWallpaperUrl(currentBlobUrl);
        }
      } else {
        if (active) setWallpaperUrl("");
      }
    };

    resolveWallpaper(wallpaperConfig);

    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<WallpaperConfig>;
      if (customEvent.detail) {
        setWallpaperConfig(customEvent.detail);
        resolveWallpaper(customEvent.detail);
      }
    };

    window.addEventListener(WALLPAPER_CHANGE_EVENT, handleWallpaperChange);

    return () => {
      active = false;
      window.removeEventListener(WALLPAPER_CHANGE_EVENT, handleWallpaperChange);
      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    };
  }, [
    wallpaperConfig.type,
    wallpaperConfig.presetId,
    wallpaperConfig.customUrl,
    wallpaperConfig.rawBlobId,
  ]);

  const changeLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setMuteState(next);
  };

  const togglePotatoMode = () => {
    const next = !potatoMode;
    setPotatoMode(next);
    setPotatoModeState(next);
  };

  const handleLoginSuccess = () => {
    createSession();
    setIsLoggedIn(true);
    setExpiredNotice(false);
    // Ensure About is open
    setOpenWindows((prev) => ({ ...prev, about: true }));
    setMinimizedWindows((prev) => ({ ...prev, about: false }));
    setActiveWindowId("about");
  };

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
  };

  const openApp = (id: AppId) => {
    playWindowOpen();
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setOpenWindows((prev) => ({ ...prev, [id]: true }));
    setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
    setWindowZIndices((prev) => ({ ...prev, [id]: nextZ }));
    setActiveWindowId(id);
  };

  const closeApp = (id: AppId) => {
    playWindowClose();
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeApp = (id: AppId) => {
    setMinimizedWindows((prev) => ({ ...prev, [id]: true }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximizeApp = (id: AppId) => {
    setMaximizedWindows((prev) => ({ ...prev, [id]: !prev[id] }));
    focusApp(id);
  };

  const focusApp = (id: AppId) => {
    if (activeWindowId === id) return;
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindowZIndices((prev) => ({ ...prev, [id]: nextZ }));
    setActiveWindowId(id);
  };

  const triggerBSOD = () => {
    setIsBSOD(true);
    setTimeout(() => {
      setIsBSOD(false);
      openApp("terminal");
    }, 3500);
  };

  // Render Fake BSOD
  if (isBSOD) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0078d7] text-white p-10 font-mono flex flex-col justify-center space-y-6 select-none animate-in fade-in duration-75">
        <div className="text-7xl font-bold">:(</div>
        <div className="text-2xl font-bold">
          Your PC ran into a problem and needs to restart.
        </div>
        <p className="text-sm max-w-xl text-blue-100">
          We're just collecting some error info, and then we'll restart for you. (100% complete)
        </p>
        <div className="text-xs text-blue-200 space-y-1 pt-4 border-t border-blue-400/40">
          <p>Stop code: KERNEL_PANIC_NODE_MODULES_OVERLOAD</p>
          <p>What failed: rm -rf / executed by user</p>
          <p className="italic text-blue-300">Rebooting back to RadjaOS Desktop...</p>
        </div>
      </div>
    );
  }

  // Render Login Screen if not authenticated
  if (!isLoggedIn) {
    return (
      <LoginScreen
        locale={locale}
        expiredNotice={expiredNotice}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090e] select-none">
      {/* Top Menu Bar */}
      <TopBar
        locale={locale}
        setLocale={changeLocale}
        isMuted={isMuted}
        toggleMute={toggleMute}
        onLockScreen={handleLogout}
        onOpenApp={openApp}
      />

      {/* Desktop Wallpaper & Background Grid Glows */}
      <div className="absolute inset-0 pt-8 pointer-events-none -z-10 overflow-hidden">
        {/* Dynamic Wallpaper Image Layer */}
        {wallpaperUrl && (
          <div
            className="absolute inset-0 transition-opacity duration-500 overflow-hidden"
            style={{
              opacity: (wallpaperConfig.opacity ?? 85) / 100,
              filter: potatoMode ? "none" : `blur(${wallpaperConfig.blur || 0}px)`,
            }}
          >
            <img
              src={wallpaperUrl}
              alt="Desktop Wallpaper"
              className="w-full h-full transition-transform duration-300 pointer-events-none"
              style={{
                objectFit: wallpaperConfig.fit || "cover",
                transform: `rotate(${wallpaperConfig.rotation || 0}deg) scaleX(${
                  wallpaperConfig.flipH ? -1 : 1
                }) scaleY(${wallpaperConfig.flipV ? -1 : 1})`,
              }}
            />
          </div>
        )}

        {/* Soft radial orbs (hidden in potato mode for 0% GPU load) */}
        {!potatoMode && (
          <>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
            <div className="absolute -bottom-40 right-10 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
          </>
        )}

        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Watermark Branding */}
        <div className="absolute bottom-16 right-6 text-right opacity-20 hidden md:block">
          <p className="text-2xl font-black tracking-widest uppercase font-mono text-neutral-400">
            RADJA.OS
          </p>
          <p className="text-[10px] font-mono text-neutral-500">
            Build 2026.4 • Junior Full Stack Edition {potatoMode && "(Eco/Potato Mode)"}
          </p>
        </div>
      </div>

      {/* Desktop App Shortcuts Grid */}
      <div className="pt-12 px-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-1 gap-2 sm:gap-3 w-fit z-10">
        <DesktopIcon
          label={t("app.about", locale)}
          icon={<User className="w-6 h-6 text-blue-400" />}
          onClick={() => openApp("about")}
        />
        <DesktopIcon
          label={t("app.projects", locale)}
          badge="3"
          icon={<FolderGit2 className="w-6 h-6 text-indigo-400" />}
          onClick={() => openApp("projects")}
        />
        <DesktopIcon
          label={t("app.skills", locale)}
          icon={<Cpu className="w-6 h-6 text-emerald-400" />}
          onClick={() => openApp("skills")}
        />
        <DesktopIcon
          label={t("app.experience", locale)}
          icon={<Briefcase className="w-6 h-6 text-amber-400" />}
          onClick={() => openApp("experience")}
        />
        <DesktopIcon
          label={t("app.terminal", locale)}
          icon={<Terminal className="w-6 h-6 text-cyan-400" />}
          onClick={() => openApp("terminal")}
        />
        <DesktopIcon
          label={t("app.settings", locale)}
          badge={potatoMode ? "🥔" : undefined}
          icon={<Settings className="w-6 h-6 text-neutral-300" />}
          onClick={() => openApp("settings")}
        />
        <DesktopIcon
          label={t("app.trash", locale)}
          badge="999GB"
          icon={<Trash2 className="w-6 h-6 text-rose-400" />}
          onClick={() => openApp("trash")}
        />
      </div>

      {/* Floating Windows System */}

      {/* 1. About Me App */}
      <WindowFrame
        id="about"
        title={t("app.about", locale)}
        icon={<User className="w-4 h-4 text-blue-400" />}
        isOpen={openWindows.about}
        isMinimized={minimizedWindows.about}
        isMaximized={maximizedWindows.about}
        isFocused={activeWindowId === "about"}
        zIndex={windowZIndices.about}
        initialWidth={680}
        initialHeight={460}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("about")}
        onMinimize={() => minimizeApp("about")}
        onToggleMaximize={() => toggleMaximizeApp("about")}
        onFocus={() => focusApp("about")}
        onHoverFocus={() => focusApp("about")}
      >
        <AboutApp
          locale={locale}
          onOpenProjects={() => openApp("projects")}
          onOpenTerminal={() => openApp("terminal")}
        />
      </WindowFrame>

      {/* 2. Projects App */}
      <WindowFrame
        id="projects"
        title={t("app.projects", locale)}
        icon={<FolderGit2 className="w-4 h-4 text-indigo-400" />}
        isOpen={openWindows.projects}
        isMinimized={minimizedWindows.projects}
        isMaximized={maximizedWindows.projects}
        isFocused={activeWindowId === "projects"}
        zIndex={windowZIndices.projects}
        initialWidth={800}
        initialHeight={540}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("projects")}
        onMinimize={() => minimizeApp("projects")}
        onToggleMaximize={() => toggleMaximizeApp("projects")}
        onFocus={() => focusApp("projects")}
        onHoverFocus={() => focusApp("projects")}
      >
        <ProjectsApp locale={locale} />
      </WindowFrame>

      {/* 3. Skills App */}
      <WindowFrame
        id="skills"
        title={t("app.skills", locale)}
        icon={<Cpu className="w-4 h-4 text-emerald-400" />}
        isOpen={openWindows.skills}
        isMinimized={minimizedWindows.skills}
        isMaximized={maximizedWindows.skills}
        isFocused={activeWindowId === "skills"}
        zIndex={windowZIndices.skills}
        initialWidth={740}
        initialHeight={480}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("skills")}
        onMinimize={() => minimizeApp("skills")}
        onToggleMaximize={() => toggleMaximizeApp("skills")}
        onFocus={() => focusApp("skills")}
        onHoverFocus={() => focusApp("skills")}
      >
        <SkillsApp locale={locale} />
      </WindowFrame>

      {/* 4. Experience App */}
      <WindowFrame
        id="experience"
        title={t("app.experience", locale)}
        icon={<Briefcase className="w-4 h-4 text-amber-400" />}
        isOpen={openWindows.experience}
        isMinimized={minimizedWindows.experience}
        isMaximized={maximizedWindows.experience}
        isFocused={activeWindowId === "experience"}
        zIndex={windowZIndices.experience}
        initialWidth={680}
        initialHeight={480}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("experience")}
        onMinimize={() => minimizeApp("experience")}
        onToggleMaximize={() => toggleMaximizeApp("experience")}
        onFocus={() => focusApp("experience")}
        onHoverFocus={() => focusApp("experience")}
      >
        <ExperienceApp locale={locale} />
      </WindowFrame>

      {/* 5. Terminal App */}
      <WindowFrame
        id="terminal"
        title={t("app.terminal", locale)}
        icon={<Terminal className="w-4 h-4 text-cyan-400" />}
        isOpen={openWindows.terminal}
        isMinimized={minimizedWindows.terminal}
        isMaximized={maximizedWindows.terminal}
        isFocused={activeWindowId === "terminal"}
        zIndex={windowZIndices.terminal}
        initialWidth={660}
        initialHeight={420}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("terminal")}
        onMinimize={() => minimizeApp("terminal")}
        onToggleMaximize={() => toggleMaximizeApp("terminal")}
        onFocus={() => focusApp("terminal")}
        onHoverFocus={() => focusApp("terminal")}
      >
        <TerminalApp
          locale={locale}
          onOpenProjects={() => openApp("projects")}
          onTriggerBSOD={triggerBSOD}
        />
      </WindowFrame>

      {/* 6. Settings App */}
      <WindowFrame
        id="settings"
        title={t("app.settings", locale)}
        icon={<Settings className="w-4 h-4 text-neutral-300" />}
        isOpen={openWindows.settings}
        isMinimized={minimizedWindows.settings}
        isMaximized={maximizedWindows.settings}
        isFocused={activeWindowId === "settings"}
        zIndex={windowZIndices.settings}
        initialWidth={600}
        initialHeight={500}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("settings")}
        onMinimize={() => minimizeApp("settings")}
        onToggleMaximize={() => toggleMaximizeApp("settings")}
        onFocus={() => focusApp("settings")}
        onHoverFocus={() => focusApp("settings")}
      >
        <SettingsApp
          locale={locale}
          setLocale={changeLocale}
          isMuted={isMuted}
          toggleMute={toggleMute}
          potatoMode={potatoMode}
          togglePotatoMode={togglePotatoMode}
          onSimulateExpiry={() => {
            setIsLoggedIn(false);
            setExpiredNotice(true);
          }}
        />
      </WindowFrame>

      {/* 7. Trash App */}
      <WindowFrame
        id="trash"
        title={t("app.trash", locale)}
        icon={<Trash2 className="w-4 h-4 text-rose-400" />}
        isOpen={openWindows.trash}
        isMinimized={minimizedWindows.trash}
        isMaximized={maximizedWindows.trash}
        isFocused={activeWindowId === "trash"}
        zIndex={windowZIndices.trash}
        initialWidth={580}
        initialHeight={400}
        isMobile={isMobile}
        potatoMode={potatoMode}
        onClose={() => closeApp("trash")}
        onMinimize={() => minimizeApp("trash")}
        onToggleMaximize={() => toggleMaximizeApp("trash")}
        onFocus={() => focusApp("trash")}
        onHoverFocus={() => focusApp("trash")}
      >
        <TrashApp locale={locale} />
      </WindowFrame>

      {/* Bottom Dock */}
      <Dock
        openWindows={openWindows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        locale={locale}
      />
    </div>
  );
};
