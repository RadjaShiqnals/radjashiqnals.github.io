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
import { DesktopSurface, ARRANGE_ICONS_EVENT } from "./DesktopSurface";
import { WindowFrame } from "./WindowFrame";
import { AppHost } from "./AppHost";
import { LoginScreen } from "./LoginScreen";
import { ContextMenu } from "./ContextMenu";
import { APPS } from "../../data/app-manifest";

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

  // Window Management States (derived from the app registry)
  const [openWindows, setOpenWindows] = useState<Record<AppId, boolean>>(
    () =>
      Object.fromEntries(
        APPS.map((app) => [app.id, app.id === "about"])
      ) as Record<AppId, boolean>
  );

  const [minimizedWindows, setMinimizedWindows] = useState<Record<AppId, boolean>>(
    () =>
      Object.fromEntries(APPS.map((app) => [app.id, false])) as Record<
        AppId,
        boolean
      >
  );

  const [maximizedWindows, setMaximizedWindows] = useState<Record<AppId, boolean>>(
    () =>
      Object.fromEntries(APPS.map((app) => [app.id, false])) as Record<
        AppId,
        boolean
      >
  );

  const [windowZIndices, setWindowZIndices] = useState<Record<AppId, number>>(
    () =>
      Object.fromEntries(
        APPS.map((app) => [app.id, app.id === "about" ? 10 : 1])
      ) as Record<AppId, number>
  );


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

  // Global launcher shortcuts: Meta tap or Ctrl/Cmd + Shift + Space.
  useEffect(() => {
    if (!isLoggedIn) return;
    let metaDown = false;
    let metaAt = 0;
    let metaUsed = false;

    const toggleStart = () => {
      window.dispatchEvent(new Event("radjaos:toggle-start"));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        toggleStart();
        return;
      }
      if (event.key === "Meta") {
        metaDown = true;
        metaAt = performance.now();
        metaUsed = false;
      } else if (metaDown) {
        metaUsed = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== "Meta" || !metaDown) return;
      const elapsed = performance.now() - metaAt;
      metaDown = false;
      if (!metaUsed && elapsed < 420) toggleStart();
    };

    const onBlur = () => {
      metaDown = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [isLoggedIn]);

  // Resolve and update dynamic wallpaper
  useEffect(() => {
    let active = true;
    let currentBlobUrl = "";

    const resolveWallpaper = async (cfg: WallpaperConfig) => {
      if (cfg.type === "preset") {
        const p =
          WALLPAPER_PRESETS.find((x) => x.id === cfg.presetId) ||
          WALLPAPER_PRESETS[0];
        if (active) setWallpaperUrl(p?.path || "/image/wallpaper/radja-dark.jpg");
      } else if (cfg.type === "url") {
        if (active) setWallpaperUrl(cfg.customUrl || "/image/wallpaper/radja-dark.jpg");
      } else if (cfg.type === "custom_raw") {
        const record = await getWallpaperBlob(
          cfg.rawBlobId || "user_custom_wallpaper"
        );
        if (record && active) {
          if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
          currentBlobUrl = URL.createObjectURL(record.blob);
          setWallpaperUrl(currentBlobUrl);
        } else if (active) {
          setWallpaperUrl("/image/wallpaper/radja-dark.jpg");
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
    const hasVisible = APPS.some(
      (app) => openWindows[app.id] && !minimizedWindows[app.id]
    );

    setMinimizedWindows(
      Object.fromEntries(APPS.map((app) => [app.id, hasVisible])) as Record<
        AppId,
        boolean
      >
    );
    if (hasVisible) setActiveWindowId(null);
  };

  const simulateExpiry = () => {
    setIsLoggedIn(false);
    setExpiredNotice(true);
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
            <p className="text-blue-300">https://radjashiqnals.github.io</p>
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
          onArrangeIcons={() => {
            window.dispatchEvent(new Event(ARRANGE_ICONS_EVENT));
            setContextMenu(null);
          }}
        />
      )}

      {/* Dynamic Wallpaper Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {wallpaperConfig.type === "mesh" ? (
          <div
            className="w-full h-full transition-opacity duration-500 overflow-hidden"
            style={{
              background:
                "radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 50%), radial-gradient(at 100% 0%, #0369a1 0px, transparent 50%), radial-gradient(at 100% 100%, #0f172a 0px, transparent 50%), radial-gradient(at 0% 100%, #111827 0px, transparent 50%), #0c1017",
              opacity: (wallpaperConfig.opacity ?? 100) / 100,
            }}
          />
        ) : wallpaperUrl ? (
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
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith("/image/wallpaper/radja-dark.jpg")) {
                  target.src = "/image/wallpaper/radja-dark.jpg";
                }
              }}
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
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 50%), radial-gradient(at 100% 0%, #0369a1 0px, transparent 50%), radial-gradient(at 100% 100%, #0f172a 0px, transparent 50%), radial-gradient(at 0% 100%, #111827 0px, transparent 50%), #0c1017",
            }}
          />
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

      {/* Desktop icon surface: free placement with grid snapping on desktop, grid on mobile */}
      <DesktopSurface locale={locale} isMobile={isMobile} openApp={openApp} />

      {/* Floating Windows System */}

      {APPS.map((app) => {
        const title = t(app.nameKey, locale);
        return (
          <WindowFrame
            key={app.id}
            id={app.id}
            title={title}
            iconSrc={app.icon}
            isOpen={openWindows[app.id]}
            isMinimized={minimizedWindows[app.id]}
            isMaximized={maximizedWindows[app.id]}
            isFocused={activeWindowId === app.id}
            zIndex={windowZIndices[app.id]}
            initialWidth={app.size.w}
            initialHeight={app.size.h}
            isMobile={isMobile}
            potatoMode={potatoMode}
            onClose={() => closeApp(app.id)}
            onMinimize={() => minimizeApp(app.id)}
            onToggleMaximize={() => toggleMaximizeApp(app.id)}
            onFocus={() => focusApp(app.id)}
            onHoverFocus={() => focusApp(app.id)}
          >
            <AppHost
              id={app.id}
              name={title}
              locale={locale}
              openApp={openApp}
              closeSelf={() => closeApp(app.id)}
              isMobile={isMobile}
              potatoMode={potatoMode}
              setLocale={changeLocale}
              isMuted={isMuted}
              toggleMute={toggleMute}
              togglePotatoMode={togglePotatoMode}
              onSimulateExpiry={simulateExpiry}
              onTriggerBSOD={triggerBSOD}
            />
          </WindowFrame>
        );
      })}

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
        onCloseApp={closeApp}
        onLockScreen={handleLogout}
        onTriggerBSOD={triggerBSOD}
        onToggleShowDesktop={toggleShowDesktop}
      />
    </div>
  );
};
