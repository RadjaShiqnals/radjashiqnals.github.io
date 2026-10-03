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
import { Taskbar } from "./Taskbar";
import { DesktopIcon } from "./DesktopIcon";
import { WindowFrame } from "./WindowFrame";
import { LoginScreen } from "./LoginScreen";
import { ContextMenu } from "./ContextMenu";

// Apps
import { AboutApp } from "./apps/AboutApp";
import { ProjectsApp } from "./apps/ProjectsApp";
import { SkillsApp } from "./apps/SkillsApp";
import { ExperienceApp } from "./apps/ExperienceApp";
import { TerminalApp } from "./apps/TerminalApp";
import { TrashApp } from "./apps/TrashApp";
import { SettingsApp } from "./apps/SettingsApp";

export const DesktopEnv: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expiredNotice, setExpiredNotice] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBSOD, setIsBSOD] = useState(false);
  const [potatoMode, setPotatoMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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

  const toggleShowDesktop = () => {
    const hasVisible = Object.entries(openWindows).some(
      ([id, isOpen]) => isOpen && !minimizedWindows[id as AppId]
    );

    if (hasVisible) {
      setMinimizedWindows({
        about: true,
        projects: true,
        skills: true,
        experience: true,
        terminal: true,
        trash: true,
        settings: true,
      });
      setActiveWindowId(null);
    } else {
      setMinimizedWindows({
        about: false,
        projects: false,
        skills: false,
        experience: false,
        terminal: false,
        trash: false,
        settings: false,
      });
    }
  };

  const triggerBSOD = () => {
    setIsBSOD(true);
    setTimeout(() => {
      setIsBSOD(false);
      openApp("terminal");
    }, 3500);
  };

  // Render Fake RadjaOS BSOD
  if (isBSOD) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0078d7] text-white p-12 font-sans flex flex-col justify-center space-y-6 select-none animate-in fade-in duration-75">
        <div className="text-8xl font-light">:(</div>
        <div className="text-3xl font-light">
          Your device ran into a problem and needs to restart.
        </div>
        <p className="text-sm max-w-xl text-blue-100 font-normal">
          We're just collecting some error info, and then we'll restart for you.
        </p>
        <p className="text-lg font-light text-white">100% complete</p>

        <div className="flex items-center gap-6 pt-6 border-t border-blue-400/30">
          <div className="w-24 h-24 bg-white p-2 rounded flex items-center justify-center">
            {/* QR Code graphic */}
            <div className="w-full h-full bg-neutral-900 grid grid-cols-4 gap-1 p-1">
              <div className="bg-white"></div>
              <div className="bg-transparent"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-transparent"></div>
              <div className="bg-white"></div>
            </div>
          </div>
          <div className="text-xs text-blue-100 space-y-1 font-mono">
            <p className="text-sm font-sans font-medium text-white">For more info and possible fixes, visit:</p>
            <p className="text-blue-300">https://windows.com/stopcode</p>
            <p className="pt-2">Stop code: SYSTEM_THREAD_EXCEPTION_NOT_HANDLED</p>
            <p>What failed: radja_stack_overflow.sys</p>
          </div>
        </div>
      </div>
    );
  }

  // Render RadjaOS Login Screen
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
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0c1017] select-none"
      onContextMenu={(e) => {
        // Only trigger desktop context menu if clicking the desktop canvas
        if ((e.target as HTMLElement).closest(".window-frame") || (e.target as HTMLElement).closest("footer")) {
          return;
        }
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => {
        if (contextMenu) setContextMenu(null);
      }}
    >
      {/* Desktop Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenApp={openApp}
          onRefresh={() => {
            playWindowOpen();
          }}
        />
      )}

      {/* Dynamic Wallpaper Layer */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {wallpaperUrl && (
          <div
            className="absolute inset-0 transition-opacity duration-500 overflow-hidden"
            style={{
              opacity: (wallpaperConfig.opacity ?? 100) / 100,
              filter: potatoMode ? "none" : `blur(${wallpaperConfig.blur || 0}px)`,
            }}
          >
            <img
              src={wallpaperUrl}
              alt="Desktop Wallpaper"
              className={`w-full h-full ${
                wallpaperConfig.fit === "contain"
                  ? "object-contain"
                  : wallpaperConfig.fit === "fill"
                  ? "object-fill"
                  : "object-cover"
              }`}
              style={{
                transform: `scaleX(${wallpaperConfig.flipH ? -1 : 1}) scaleY(${
                  wallpaperConfig.flipV ? -1 : 1
                }) rotate(${wallpaperConfig.rotation || 0}deg)`,
              }}
            />
          </div>
        )}

        {/* RadjaOS Evaluation Watermark (Bottom Right) */}
        <div className="absolute bottom-16 right-6 text-right opacity-30 pointer-events-none hidden md:block">
          <p className="text-xs font-normal text-white drop-shadow">
            RadjaOS Desktop Pro
          </p>
          <p className="text-[11px] font-normal text-neutral-300 drop-shadow">
            Edition v2.4 (Build 2408) {potatoMode && "• (Eco Mode)"}
          </p>
        </div>
      </div>

      {/* Desktop App Shortcuts (Mobile Grid vs Desktop Left Column) */}
      <div className="pt-6 sm:pt-4 pb-20 px-4 sm:px-3 grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-col md:flex-wrap gap-y-5 gap-x-2 md:gap-2 w-full max-w-sm sm:max-w-md md:w-fit md:h-full z-10 pointer-events-auto">
        <DesktopIcon
          label={t("app.about", locale)}
          iconSrc="/image/win11/thispc.png"
          onClick={() => openApp("about")}
        />
        <DesktopIcon
          label={t("app.projects", locale)}
          badge="3"
          iconSrc="/image/win11/explorer.png"
          onClick={() => openApp("projects")}
        />
        <DesktopIcon
          label={t("app.skills", locale)}
          iconSrc="/image/win11/vscode.png"
          onClick={() => openApp("skills")}
        />
        <DesktopIcon
          label={t("app.experience", locale)}
          iconSrc="/image/win11/edge.png"
          onClick={() => openApp("experience")}
        />
        <DesktopIcon
          label={t("app.terminal", locale)}
          iconSrc="/image/win11/terminal.png"
          onClick={() => openApp("terminal")}
        />
        <DesktopIcon
          label={t("app.settings", locale)}
          badge={potatoMode ? "🥔" : undefined}
          iconSrc="/image/win11/settings.png"
          onClick={() => openApp("settings")}
        />
        <DesktopIcon
          label={t("app.trash", locale)}
          badge="999GB"
          iconSrc="/image/win11/bin0.png"
          onClick={() => openApp("trash")}
        />
      </div>

      {/* Floating Windows System */}

      {/* 1. About Me App */}
      <WindowFrame
        id="about"
        title={t("app.about", locale)}
        iconSrc="/image/win11/thispc.png"
        isOpen={openWindows.about}
        isMinimized={minimizedWindows.about}
        isMaximized={maximizedWindows.about}
        isFocused={activeWindowId === "about"}
        zIndex={windowZIndices.about}
        initialWidth={720}
        initialHeight={480}
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
        iconSrc="/image/win11/explorer.png"
        isOpen={openWindows.projects}
        isMinimized={minimizedWindows.projects}
        isMaximized={maximizedWindows.projects}
        isFocused={activeWindowId === "projects"}
        zIndex={windowZIndices.projects}
        initialWidth={820}
        initialHeight={550}
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
        iconSrc="/image/win11/vscode.png"
        isOpen={openWindows.skills}
        isMinimized={minimizedWindows.skills}
        isMaximized={maximizedWindows.skills}
        isFocused={activeWindowId === "skills"}
        zIndex={windowZIndices.skills}
        initialWidth={750}
        initialHeight={490}
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
        iconSrc="/image/win11/edge.png"
        isOpen={openWindows.experience}
        isMinimized={minimizedWindows.experience}
        isMaximized={maximizedWindows.experience}
        isFocused={activeWindowId === "experience"}
        zIndex={windowZIndices.experience}
        initialWidth={700}
        initialHeight={500}
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
        iconSrc="/image/win11/terminal.png"
        isOpen={openWindows.terminal}
        isMinimized={minimizedWindows.terminal}
        isMaximized={maximizedWindows.terminal}
        isFocused={activeWindowId === "terminal"}
        zIndex={windowZIndices.terminal}
        initialWidth={680}
        initialHeight={520}
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
        iconSrc="/image/win11/settings.png"
        isOpen={openWindows.settings}
        isMinimized={minimizedWindows.settings}
        isMaximized={maximizedWindows.settings}
        isFocused={activeWindowId === "settings"}
        zIndex={windowZIndices.settings}
        initialWidth={620}
        initialHeight={520}
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
        iconSrc="/image/win11/bin0.png"
        isOpen={openWindows.trash}
        isMinimized={minimizedWindows.trash}
        isMaximized={maximizedWindows.trash}
        isFocused={activeWindowId === "trash"}
        zIndex={windowZIndices.trash}
        initialWidth={600}
        initialHeight={420}
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

      {/* RadjaOS Bottom Taskbar */}
      <Taskbar
        openWindows={openWindows}
        minimizedWindows={minimizedWindows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onMinimizeApp={minimizeApp}
        locale={locale}
        setLocale={changeLocale}
        isMuted={isMuted}
        toggleMute={toggleMute}
        potatoMode={potatoMode}
        togglePotatoMode={togglePotatoMode}
        onLockScreen={handleLogout}
        onTriggerBSOD={triggerBSOD}
        onToggleShowDesktop={toggleShowDesktop}
      />
    </div>
  );
};
