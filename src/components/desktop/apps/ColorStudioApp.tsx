import React, { useState, useMemo } from "react";
import type { Locale } from "../../../lib/i18n";
import { Copy, Check, Palette, Sparkles, SlidersHorizontal, Eye } from "lucide-react";
import { parse, formatHex, formatRgb, formatHsl, wcagContrast, oklch } from "culori";

interface ColorStudioAppProps {
  locale: Locale;
}

type Tab = "single" | "gradient" | "contrast";

export const ColorStudioApp: React.FC<ColorStudioAppProps> = () => {
  const [activeTab, setActiveTab] = useState<Tab>("single");
  const [hexInput, setHexInput] = useState("#0078d4");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gradient State
  const [gradColor1, setGradColor1] = useState("#0078d4");
  const [gradColor2, setGradColor2] = useState("#60cdff");
  const [gradAngle, setGradAngle] = useState(135);

  // Contrast State
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0f172a");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Parsed Color Info
  const colorInfo = useMemo(() => {
    try {
      const parsed = parse(hexInput) || parse("#0078d4");
      const hex = formatHex(parsed);
      const rgb = formatRgb(parsed);
      const hsl = formatHsl(parsed);
      const oklchVal = oklch(parsed);
      const oklchStr = oklchVal
        ? `oklch(${(oklchVal.l * 100).toFixed(1)}% ${oklchVal.c.toFixed(3)} ${oklchVal.h ? oklchVal.h.toFixed(1) : "0"})`
        : "N/A";

      return { hex, rgb, hsl, oklchStr, valid: true };
    } catch {
      return { hex: "#0078d4", rgb: "rgb(0, 120, 212)", hsl: "hsl(206, 100%, 42%)", oklchStr: "", valid: false };
    }
  }, [hexInput]);

  // Contrast Ratio Calculation
  const contrastRatio = useMemo(() => {
    try {
      const ratio = wcagContrast(fgColor, bgColor);
      return Number.isFinite(ratio) ? ratio : 1;
    } catch {
      return 1;
    }
  }, [fgColor, bgColor]);

  const gradientCSS = `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`;

  return (
    <div className="h-full w-full flex flex-col bg-[#141414]/95 text-neutral-200 select-none overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-black/30">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "single"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Color Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab("gradient")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "gradient"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gradient Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("contrast")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "contrast"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>WCAG Contrast</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "single" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg">
              <div
                className="w-28 h-28 rounded-2xl border border-white/20 shadow-inner shrink-0 transition-colors"
                style={{ backgroundColor: colorInfo.hex }}
              />
              <div className="flex-1 w-full space-y-3">
                <label className="text-xs font-semibold text-neutral-300 block">Color Picker</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorInfo.hex}
                    onChange={(e) => setHexInput(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="#0078d4"
                  />
                </div>
              </div>
            </div>

            {/* Format Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "HEX", val: colorInfo.hex || "" },
                { label: "RGB", val: colorInfo.rgb || "" },
                { label: "HSL", val: colorInfo.hsl || "" },
                { label: "OKLCH", val: colorInfo.oklchStr || "" },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">{label}</span>
                    <span className="text-xs font-mono text-white truncate block">{val}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(val, label)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title={`Copy ${label}`}
                  >
                    {copiedKey === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gradient" && (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Live Preview */}
            <div
              className="w-full h-36 rounded-2xl border border-white/15 shadow-xl transition-all"
              style={{ background: gradientCSS }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Color 1</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradColor1}
                    onChange={(e) => setGradColor1(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={gradColor1}
                    onChange={(e) => setGradColor1(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-black/40 border border-white/10 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Color 2</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradColor2}
                    onChange={(e) => setGradColor2(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={gradColor2}
                    onChange={(e) => setGradColor2(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-black/40 border border-white/10 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div className="col-span-full space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5" /> Angle</span>
                  <span>{gradAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradAngle}
                  onChange={(e) => setGradAngle(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Export Code */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="font-mono text-xs text-neutral-300 truncate pr-3">{`background: ${gradientCSS};`}</span>
              <button
                onClick={() => copyToClipboard(`background: ${gradientCSS};`, "css-gradient")}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium transition-colors cursor-pointer shrink-0"
              >
                {copiedKey === "css-gradient" ? "Copied!" : "Copy CSS"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "contrast" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Foreground (Text)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-black/40 border border-white/10 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-black/40 border border-white/10 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Contrast Card Preview */}
            <div
              className="w-full p-6 rounded-2xl border border-white/15 shadow-xl transition-colors text-center"
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <h4 className="text-2xl font-bold mb-1">Contrast Preview Title</h4>
              <p className="text-sm opacity-90">The quick brown fox jumps over the lazy dog.</p>
            </div>

            {/* Score & Badges */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block">WCAG Contrast Ratio</span>
                <span className="text-2xl font-mono font-bold text-white">{contrastRatio.toFixed(2)} : 1</span>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    contrastRatio >= 4.5
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  AA ({contrastRatio >= 4.5 ? "Pass" : "Fail"})
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    contrastRatio >= 7.0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  AAA ({contrastRatio >= 7.0 ? "Pass" : "Fail"})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
