import React, { useState, useEffect } from "react";
import { type Locale, localeNames, t } from "../../lib/i18n";
import { Volume2, VolumeX, BatteryCharging, Wifi, Lock, LogOut, Globe, Sparkles } from "lucide-react";
import { playWindowOpen } from "../../lib/sound";

interface TopBarProps {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isMuted: boolean;
  toggleMute: () => void;
  onLockScreen: () => void;
  onOpenApp: (id: any) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  locale,
  setLocale,
  isMuted,
  toggleMute,
  onLockScreen,
  onOpenApp,
}) => {
  const [time, setTime] = useState("");
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Jakarta",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-3 text-xs text-neutral-300 select-none">
      {/* Left Menu Section */}
      <div className="flex items-center gap-4">
        {/* Apple/RadjaOS Logo */}
        <div className="relative">
          <button
            onClick={() => {
              playWindowOpen();
              setShowAppleMenu(!showAppleMenu);
            }}
            className="flex items-center gap-1.5 font-bold text-white hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="tracking-wider">RadjaOS</span>
          </button>

          {showAppleMenu && (
            <div
              className="absolute left-0 top-7 w-48 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 z-50 text-neutral-200 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowAppleMenu(false)}
            >
              <button
                onClick={() => {
                  onOpenApp("about");
                  setShowAppleMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <span>{t("app.about", locale)}</span>
              </button>
              <button
                onClick={() => {
                  onOpenApp("settings");
                  setShowAppleMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <span>{t("app.settings", locale)}</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  onLockScreen();
                  setShowAppleMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-500/20 text-red-300 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("sys.logout", locale)}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t("topbar.status", locale)}</span>
        </div>
      </div>

      {/* Right Action Section */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] font-mono font-semibold">
              {locale}
            </span>
          </button>

          {showLangMenu && (
            <div
              className="absolute right-0 top-7 w-32 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl py-1 z-50"
              onMouseLeave={() => setShowLangMenu(false)}
            >
              {(Object.keys(localeNames) as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer hover:bg-blue-600/30 hover:text-white ${
                    locale === loc ? "text-blue-400 font-semibold" : "text-neutral-300"
                  }`}
                >
                  <span>{localeNames[loc].label}</span>
                  <span>{localeNames[loc].flag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          className="hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
          title={isMuted ? t("sys.soundMuted", locale) : t("sys.soundActive", locale)}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          )}
        </button>

        {/* Satirical Battery & WiFi */}
        <div
          className="hidden sm:flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
          title="WiFi: Connected to Radja Fiber Gigabit | Battery: 99% (Fueled by Kopi SWAG)"
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Realtime Clock (WIB) */}
        <div className="font-mono text-[11px] text-neutral-200 tracking-wider">
          <span>{time}</span>
          <span className="text-neutral-500 ml-1 text-[10px] hidden sm:inline">WIB</span>
        </div>

        {/* Lock Screen Shortcut */}
        <button
          onClick={onLockScreen}
          className="hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
          title={t("sys.lock", locale)}
        >
          <Lock className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
