import React, { useState, useMemo } from "react";
import type { Locale } from "../../../lib/i18n";
import { Copy, Check, Download, FileText, ArrowRightLeft, Sparkles, Wand2 } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import TurndownService from "turndown";

marked.use({
  gfm: true,
  breaks: true,
});

interface TextWorkbenchAppProps {
  locale: Locale;
}

type WorkbenchMode = "markdown" | "html2md" | "transform" | "regex";

export const TextWorkbenchApp: React.FC<TextWorkbenchAppProps> = () => {
  const [mode, setMode] = useState<WorkbenchMode>("markdown");
  const [input, setInput] = useState<string>(
    "# Welcome to Text Workbench\n\nThis is a live, secure **in-browser** Markdown previewer and text transform engine.\n\n- Zero telemetry\n- 100% Client-side\n- Instant HTML & Markdown conversions"
  );
  const [regexFind, setRegexFind] = useState("");
  const [regexReplace, setRegexReplace] = useState("");
  const [copied, setCopied] = useState(false);

  // Turndown instance for HTML to Markdown
  const turndown = useMemo(() => new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" }), []);

  // Compute processed output
  const output = useMemo(() => {
    if (!input) return "";

    if (mode === "markdown") {
      try {
        const rawHtml = marked.parse(input) as string;
        return typeof window !== "undefined" ? DOMPurify.sanitize(rawHtml) : rawHtml;
      } catch (err) {
        return `<p class="text-red-400">Parse error: ${String(err)}</p>`;
      }
    }

    if (mode === "html2md") {
      try {
        return turndown.turndown(input);
      } catch (err) {
        return `Conversion error: ${String(err)}`;
      }
    }

    if (mode === "regex") {
      if (!regexFind) return input;
      try {
        const re = new RegExp(regexFind, "g");
        return input.replace(re, regexReplace);
      } catch (err) {
        return `Regex error: ${String(err)}`;
      }
    }

    return input;
  }, [input, mode, regexFind, regexReplace, turndown]);

  // Text Transform Actions
  const applyTransform = (type: string) => {
    let result = input;
    switch (type) {
      case "upper":
        result = input.toUpperCase();
        break;
      case "lower":
        result = input.toLowerCase();
        break;
      case "title":
        result = input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
        break;
      case "trim":
        result = input
          .split("\n")
          .map((line) => line.trim())
          .join("\n");
        break;
      case "sort":
        result = input.split("\n").sort().join("\n");
        break;
      case "unique":
        result = Array.from(new Set(input.split("\n"))).join("\n");
        break;
      default:
        break;
    }
    setInput(result);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadOutput = () => {
    const ext = mode === "markdown" ? "html" : "txt";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workbench-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="h-full w-full flex flex-col bg-[#141414]/95 text-neutral-200 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "markdown", label: "Markdown Preview", icon: FileText },
            { id: "html2md", label: "HTML → Markdown", icon: ArrowRightLeft },
            { id: "transform", label: "Transforms", icon: Sparkles },
            { id: "regex", label: "Regex Replace", icon: Wand2 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as WorkbenchMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                mode === item.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            {wordCount} words &bull; {charCount} chars
          </span>
          <button
            onClick={copyOutput}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={downloadOutput}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Download output"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Regex Sub-bar if regex mode is active */}
      {mode === "regex" && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white/[0.02] border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Find:</span>
            <input
              type="text"
              value={regexFind}
              onChange={(e) => setRegexFind(e.target.value)}
              placeholder="e.g. \bfoo\b"
              className="px-2 py-1 rounded bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Replace:</span>
            <input
              type="text"
              value={regexReplace}
              onChange={(e) => setRegexReplace(e.target.value)}
              placeholder="e.g. bar"
              className="px-2 py-1 rounded bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      )}

      {/* Quick Transform Buttons if transform mode */}
      {mode === "transform" && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 bg-white/[0.02] border-b border-white/10 text-xs">
          {[
            { id: "upper", label: "UPPERCASE" },
            { id: "lower", label: "lowercase" },
            { id: "title", label: "Title Case" },
            { id: "trim", label: "Trim Lines" },
            { id: "sort", label: "Sort Lines" },
            { id: "unique", label: "Deduplicate" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => applyTransform(btn.id)}
              className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Split Panes */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Input Pane */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black/20 p-3">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Input</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste input here..."
            className="flex-1 w-full bg-transparent resize-none font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none leading-relaxed select-text"
          />
        </div>

        {/* Output Pane */}
        <div className="flex-1 flex flex-col bg-black/40 p-3 overflow-hidden">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Output Preview</span>
          {mode === "markdown" ? (
            <div
              className="flex-1 overflow-y-auto markdown-preview text-xs text-neutral-200 leading-relaxed pr-2 select-text"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          ) : (
            <textarea
              readOnly
              value={output}
              className="flex-1 w-full bg-transparent resize-none font-mono text-xs text-cyan-300 focus:outline-none leading-relaxed select-text"
            />
          )}
        </div>
      </div>
    </div>
  );
};
