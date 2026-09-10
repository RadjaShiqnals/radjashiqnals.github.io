import React, { useState, useEffect } from "react";
import { type Locale, t } from "../../lib/i18n";
import { playBootChime } from "../../lib/sound";
import { ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

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

  // Simulated Bootloader Preload
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white select-none transition-all duration-700 ${
        isUnlocking ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {!isBooted ? (
        /* Boot Preloader Screen */
        <div className="w-full max-w-sm px-6 space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>

          <div className="space-y-1">
            <h1 className="text-sm font-bold tracking-widest uppercase font-mono text-neutral-200">
              RadjaOS Boot Core
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              {bootProgress < 50
                ? t("sys.booting", locale)
                : bootProgress < 100
                ? t("sys.loadingAssets", locale)
                : t("sys.ready", locale)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-150 rounded-full"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Login Card Screen */
        <div className="w-full max-w-md px-6 space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Satirical 7-Day Expiry Banner */}
          {expiredNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left space-y-1 shadow-lg animate-in slide-in-from-top-4">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t("sys.sessionExpiredTitle", locale)}</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                {t("sys.sessionExpiredDesc", locale)}
              </p>
            </div>
          )}

          {/* User Avatar with Halo */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/20 bg-neutral-800 shadow-2xl mx-auto">
              <img
                src="/image/about-me-profile.png"
                alt="Radja Genta"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-950 shadow flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
            </div>
          </div>

          {/* Profile Name & Tagline */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Radja Genta Saputra
            </h2>
            <p className="text-xs text-blue-400 font-medium">{t("sys.role", locale)}</p>
          </div>

          {/* Satirical Toast Feedback */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono animate-in fade-in">
              {toastMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative max-w-xs mx-auto">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("sys.passPlaceholder", locale)}
                autoFocus
                className="w-full h-10 px-4 pr-10 rounded-full bg-neutral-900/80 border border-white/15 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                title="Enter"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">
              <span>Press </span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-white/10 text-[10px] font-mono text-neutral-300">
                Enter
              </kbd>
              <span> or click arrow to log in</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
