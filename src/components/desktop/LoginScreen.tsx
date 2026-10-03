import React, { useState, useEffect } from "react";
import { type Locale, t } from "../../lib/i18n";
import { playBootChime } from "../../lib/sound";
import { ArrowRight, ShieldAlert, Wifi, BatteryCharging, Power } from "lucide-react";

interface LoginScreenProps {
  locale: Locale;
  expiredNotice: boolean;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  locale,
  expiredNotice,
  onLoginSuccess,
}) => {
  const [bootProgress, setBootProgress] = useState(0);
  const [isBooted, setIsBooted] = useState(false);
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Realtime clock for RadjaOS Lockscreen
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated RadjaOS Bootloader Preload
  useEffect(() => {
    const timer = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsBooted(true);
          return 100;
        }
        return prev + 25;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    const trimmed = password.trim().toLowerCase();

    // Check Easter Egg triggers
    if (trimmed === "mommy") {
      setToastMessage(t("sys.mommyEasterEgg", locale));
    } else if (trimmed === "sudo") {
      setToastMessage(t("sys.sudoEasterEgg", locale));
    } else {
      setToastMessage(t("sys.securityPassToast", locale));
    }

    playBootChime();
    setIsUnlocking(true);

    setTimeout(() => {
      onLoginSuccess();
    }, 800);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0c1017] text-white select-none transition-all duration-700 ${
        isUnlocking ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: "url('/image/wallpaper/win11-dark.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark frosted overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-xl -z-10" />

      {/* Top Lockscreen Clock */}
      <div className="pt-16 sm:pt-20 text-center space-y-1">
        <h1 className="text-6xl sm:text-7xl font-light tracking-tight text-white/95 font-sans drop-shadow-lg">
          {timeStr}
        </h1>
        <p className="text-sm sm:text-base font-normal text-white/80 drop-shadow">
          {dateStr}
        </p>
      </div>

      {!isBooted ? (
        /* RadjaOS Spinning Dots Bootloader */
        <div className="w-full max-w-sm px-6 space-y-5 text-center my-auto">
          {/* RadjaOS Spinning Circle Indicator */}
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wider text-neutral-200">
              RadjaOS Desktop Pro
            </h2>
            <p className="text-xs text-neutral-400">
              {bootProgress < 50
                ? t("sys.booting", locale)
                : bootProgress < 100
                ? t("sys.loadingAssets", locale)
                : t("sys.ready", locale)}
            </p>
          </div>
        </div>
      ) : (
        /* RadjaOS User Sign-In Box */
        <div className="w-full max-w-sm px-6 space-y-5 text-center my-auto animate-win-flyout">
          {/* Satirical 7-Day Expiry Notice */}
          {expiredNotice && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs text-left space-y-1 shadow-lg">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t("sys.sessionExpiredTitle", locale)}</span>
              </div>
              <p className="text-[11px] text-amber-100/80 leading-relaxed">
                {t("sys.sessionExpiredDesc", locale)}
              </p>
            </div>
          )}

          {/* User Avatar */}
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/30 bg-neutral-800 shadow-2xl mx-auto ring-4 ring-black/30">
              <img
                src="/image/about-me-profile.png"
                alt="Radja Genta"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold text-white tracking-tight drop-shadow">
              Radja Genta Saputra
            </h2>
            <p className="text-xs text-blue-300 font-medium drop-shadow">
              {t("sys.role", locale)}
            </p>
          </div>

          {/* Toast feedback */}
          {toastMessage && (
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono animate-in fade-in">
              {toastMessage}
            </div>
          )}

          {/* RadjaOS Sign-in input */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative max-w-xs mx-auto">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("sys.passPlaceholder", locale)}
                autoFocus
                className="w-full h-10 px-4 pr-10 rounded-md bg-black/40 border border-white/20 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-400 focus:bg-black/60 focus:ring-1 focus:ring-blue-400 transition-all text-center"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 w-8 h-8 rounded-md hover:bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Sign in"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-white/60 drop-shadow">
              <span>Press </span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white">
                Enter
              </kbd>
              <span> to sign in</span>
            </div>
          </form>
        </div>
      )}

      {/* Bottom Right System Controls */}
      <div className="w-full p-6 flex items-center justify-end gap-4 text-white/80">
        <span title="Internet: Connected">
          <Wifi className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
        </span>
        <span title="Power: 100%">
          <BatteryCharging className="w-5 h-5 text-emerald-400 hover:text-white transition-colors cursor-pointer" />
        </span>
        <span title="Power">
          <Power className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
        </span>
      </div>
    </div>
  );
};
