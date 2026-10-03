import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { type Locale, t } from "../../../lib/i18n";
import { Sparkles, MapPin, Terminal, Mail, ExternalLink, Coffee, X, Heart, Wallet } from "lucide-react";

interface AboutAppProps {
  locale: Locale;
  onOpenProjects: () => void;
  onOpenTerminal: () => void;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

export const AboutApp: React.FC<AboutAppProps> = ({
  locale,
  onOpenProjects,
  onOpenTerminal,
}) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [saweriaQrUrl, setSaweriaQrUrl] = useState("");
  const [kofiQrUrl, setKofiQrUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL("https://saweria.co/radjashiqnals", {
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (isMounted) setSaweriaQrUrl(url);
      })
      .catch(() => {});

    QRCode.toDataURL("https://ko-fi.com/radjashiqnals", {
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (isMounted) setKofiQrUrl(url);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-white/10 text-center sm:text-left">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-neutral-800 shadow-xl">
            <img
              src="/image/about-me-profile.png"
              alt="Radja Genta"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-900 shadow"></span>
        </div>

        <div className="space-y-1 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
            <Sparkles className="w-3 h-3" />
            <span>{t("sys.role", locale)}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Radja Genta Saputra</h1>
          <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
            <span>Malang / Probolinggo, East Java, Indonesia</span>
          </p>
        </div>
      </div>

      {/* Intro Text */}
      <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
        <p>{t("about.intro", locale)}</p>
        <p className="text-neutral-400">{t("about.focus", locale)}</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div
          onClick={onOpenProjects}
          className="p-3.5 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-white/10 hover:border-blue-500/40 cursor-pointer transition-all group"
        >
          <div className="text-xs font-semibold text-white group-hover:text-blue-400 flex items-center justify-between">
            <span>Explore Projects</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-blue-400" />
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            View web applications, experiments, and projects.
          </p>
        </div>

        <div
          onClick={onOpenTerminal}
          className="p-3.5 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="text-xs font-semibold text-white group-hover:text-cyan-400 flex items-center justify-between">
            <span>Launch Terminal</span>
            <Terminal className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400" />
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Interact with the simulated CLI and discover funny easter eggs.
          </p>
        </div>

        {/* Support & Donation Card */}
        <div
          onClick={() => setShowSupportModal(true)}
          className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-neutral-900 to-amber-950/20 hover:border-emerald-500/40 border border-emerald-500/20 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1.5">
                <span>{t("about.supportCoffee", locale)}</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {t("about.qrisDesc", locale)}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0 pl-2">
            View &rarr;
          </span>
        </div>
      </div>

      {/* Social Links Bar */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
        <span className="text-[11px]">{t("about.quickHint", locale)}</span>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/radjashiqnals"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            title="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com/in/radjashiqnals"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            title="LinkedIn"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>
          <a
            href="mailto:radjashiqnals@gmail.com"
            className="hover:text-white transition-colors"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Support & Payment Channels Modal */}
      {showSupportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setShowSupportModal(false)}
        >
          <div
            className="bg-[#181818] border border-white/15 rounded-2xl p-4 sm:p-5 max-w-3xl w-full my-auto space-y-3.5 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1 pr-6 pl-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <Coffee className="w-3 h-3" />
                <span>{t("about.qrisTitle", locale)}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Support Radja's Creative & Code Journey
              </h2>
              <p className="text-[11px] text-neutral-400 max-w-lg mx-auto">
                {t("about.supportModalSubtitle", locale)}
              </p>
            </div>

            {/* Top Section: QR Codes Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. QRIS Bank Mandiri */}
              <div className="bg-neutral-900/90 border border-emerald-500/30 rounded-xl p-3 flex flex-col items-center text-center relative overflow-hidden group shadow-lg">
                <div className="w-full flex justify-center mb-1.5">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {t("about.recommendedIndo", locale)}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-white">QRIS Mandiri</h3>
                <p className="text-[10px] text-neutral-400 mb-1.5">
                  Merchant: <span className="text-neutral-200 font-medium">RadjaShiqnals</span>
                </p>
                <div className="bg-white p-1.5 rounded-lg shadow border border-neutral-200 mb-2">
                  <img
                    src="/qris.png"
                    alt="QRIS Mandiri"
                    className="w-24 h-24 object-contain mx-auto"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-auto leading-relaxed">
                  {t("about.qrisMandiriDesc", locale)}
                </p>
              </div>

              {/* 2. Saweria QR */}
              <div className="bg-neutral-900/90 border border-orange-500/30 rounded-xl p-3 flex flex-col items-center text-center relative overflow-hidden group shadow-lg">
                <div className="w-full flex justify-center mb-1.5">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {t("about.localIndo", locale)}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-white">Saweria</h3>
                <p className="text-[10px] text-neutral-400 mb-1.5">
                  <span className="text-orange-300/90 font-mono">saweria.co/radjashiqnals</span>
                </p>
                <div className="bg-white p-1.5 rounded-lg shadow border border-neutral-200 mb-2">
                  {saweriaQrUrl ? (
                    <img
                      src={saweriaQrUrl}
                      alt="Saweria QR"
                      className="w-24 h-24 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-neutral-400 text-xs">
                      Loading...
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 mt-auto leading-relaxed">
                  {t("about.saweriaDesc", locale)}
                </p>
              </div>

              {/* 3. Ko-fi QR */}
              <div className="bg-neutral-900/90 border border-rose-500/30 rounded-xl p-3 flex flex-col items-center text-center relative overflow-hidden group shadow-lg">
                <div className="w-full flex justify-center mb-1.5">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {t("about.globalUniversal", locale)}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-white">Ko-fi</h3>
                <p className="text-[10px] text-neutral-400 mb-1.5">
                  <span className="text-rose-300/90 font-mono">ko-fi.com/radjashiqnals</span>
                </p>
                <div className="bg-white p-1.5 rounded-lg shadow border border-neutral-200 mb-2">
                  {kofiQrUrl ? (
                    <img
                      src={kofiQrUrl}
                      alt="Ko-fi QR"
                      className="w-24 h-24 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-neutral-400 text-xs">
                      Loading...
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 mt-auto leading-relaxed">
                  {t("about.kofiDesc", locale)}
                </p>
              </div>
            </div>

            {/* Bottom Section: Direct URL Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <p className="text-[11px] text-neutral-400 font-medium">Direct Links / Payment Portals:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Saweria Button */}
                <a
                  href="https://saweria.co/radjashiqnals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-orange-200 flex items-center gap-1.5">
                        <span>{t("about.supportSaweriaBtn", locale)}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-orange-500/30 text-orange-200 font-mono">
                          ID
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        E-Wallet, QRIS, & Media Share
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </a>

                {/* Ko-fi Button */}
                <a
                  href="https://ko-fi.com/radjashiqnals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-rose-200 flex items-center gap-1.5">
                        <span>{t("about.supportKofiBtn", locale)}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/30 text-rose-200 font-mono">
                          GLOBAL
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        PayPal, Credit/Debit Cards, Stripe
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </a>
              </div>
            </div>

            {/* Footnote */}
            <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
              Mendukung semua aplikasi e-wallet & m-Banking (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay) serta pembayaran internasional via PayPal. Terima kasih banyak! 💖
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
