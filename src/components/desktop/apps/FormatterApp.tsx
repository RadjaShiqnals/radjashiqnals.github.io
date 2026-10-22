import React, { useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { Copy, Check, Wand2 } from "lucide-react";
import * as prettier from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import * as htmlPlugin from "prettier/plugins/html";
import * as postcssPlugin from "prettier/plugins/postcss";

interface FormatterAppProps {
  locale: Locale;
}

type Language = "javascript" | "typescript" | "json" | "html" | "css";

const DEFAULT_CODE = `function calculateStats(items){
let total=0;items.forEach(item=>{total+=item.price*item.qty});
return {total:total,count:items.length,status:"ok"}
}`;

export const FormatterApp: React.FC<FormatterAppProps> = () => {
  const [lang, setLang] = useState<Language>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [tabWidth, setTabWidth] = useState(2);
  const [semi, setSemi] = useState(true);
  const [singleQuote, setSingleQuote] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  const formatCode = async () => {
    setIsFormatting(true);
    setErrorMsg(null);
    try {
      let parser = "babel";
      const plugins = [babelPlugin, estreePlugin, htmlPlugin, postcssPlugin];

      if (lang === "json") parser = "json";
      else if (lang === "typescript") parser = "babel-ts";
      else if (lang === "html") parser = "html";
      else if (lang === "css") parser = "css";

      const formatted = await prettier.format(code, {
        parser,
        plugins,
        tabWidth,
        semi,
        singleQuote,
      });

      setCode(formatted);
    } catch (err) {
      setErrorMsg(String(err));
    } finally {
      setIsFormatting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#141414]/95 text-neutral-200 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
            {(["javascript", "typescript", "json", "html", "css"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded text-xs capitalize font-medium transition-colors cursor-pointer ${
                  lang === l
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Options Dropdown / Toggles */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10 text-xs text-neutral-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span>Indent:</span>
              <select
                value={tabWidth}
                onChange={(e) => setTabWidth(Number(e.target.value))}
                className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-white"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={semi}
                onChange={(e) => setSemi(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Semicolons</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={singleQuote}
                onChange={(e) => setSingleQuote(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Single quotes</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={formatCode}
            disabled={isFormatting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isFormatting ? "Formatting..." : "Format Code"}</span>
          </button>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="px-4 py-2 bg-red-500/15 border-b border-red-500/30 text-red-300 text-xs font-mono break-all">
          {errorMsg}
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex flex-col p-4 bg-black/30 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste unformatted code here..."
          className="flex-1 w-full bg-transparent resize-none font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none leading-relaxed select-text"
        />
      </div>
    </div>
  );
};
