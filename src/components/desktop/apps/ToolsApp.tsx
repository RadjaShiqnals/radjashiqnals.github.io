import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  FileCode,
  Binary,
  Hash,
  KeyRound,
  Fingerprint,
  Clock,
  QrCode,
  Palette,
  Search,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Download,
  RefreshCw,
} from "lucide-react";
import { type Locale } from "../../../lib/i18n";
import {
  computeSubtleHash,
  computeMD5,
  decodeJWT,
  type DecodedJWT,
  calculateContrastRatio,
  generateSecureToken,
} from "../../../lib/tools-utils";

export type ToolId =
  | "json"
  | "base64"
  | "hash"
  | "jwt"
  | "uuid"
  | "epoch"
  | "qrcode"
  | "color";

interface ToolItem {
  id: ToolId;
  name: string;
  category: "formatters" | "converters" | "security" | "generators";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TOOLS_REGISTRY: ToolItem[] = [
  {
    id: "json",
    name: "JSON Formatter",
    category: "formatters",
    description: "Format, validate, and minify JSON data with syntax checks",
    icon: FileCode,
    badge: "Popular",
  },
  {
    id: "base64",
    name: "Base64 & URL",
    category: "converters",
    description: "Encode and decode text, URLs, and images to Base64 Data URI",
    icon: Binary,
  },
  {
    id: "hash",
    name: "Hash Machine",
    category: "security",
    description: "Cryptographic hash generation for MD5, SHA-1, SHA-256, SHA-512",
    icon: Hash,
  },
  {
    id: "jwt",
    name: "JWT Inspector",
    category: "security",
    description: "Inspect JSON Web Tokens, expiration dates, and claims offline",
    icon: KeyRound,
    badge: "Offline",
  },
  {
    id: "uuid",
    name: "UUID & Tokens",
    category: "generators",
    description: "Generate UUID v4 and high-entropy secure random tokens",
    icon: Fingerprint,
  },
  {
    id: "epoch",
    name: "Unix Epoch",
    category: "converters",
    description: "Live Unix timestamp ticker and human date converter",
    icon: Clock,
  },
  {
    id: "qrcode",
    name: "QR Code Studio",
    category: "generators",
    description: "Generate and download custom QR codes from text or URLs",
    icon: QrCode,
  },
  {
    id: "color",
    name: "Color & Contrast",
    category: "converters",
    description: "HEX/RGB/HSL converter and WCAG accessibility contrast tester",
    icon: Palette,
  },
];

interface ToolsAppProps {
  locale: Locale;
}

export const ToolsApp: React.FC<ToolsAppProps> = ({ locale }) => {
  const [activeTool, setActiveTool] = useState<ToolId>("json");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key = "default") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#181818]/90 text-neutral-200 select-none overflow-hidden">
      {/* ─── SIDEBAR (TOOL PICKER) ─── */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/30 flex flex-col shrink-0">
        {/* Search Header */}
        <div className="p-3 border-b border-white/10 flex flex-col gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
            />
          </div>

          {/* Quick Category Badges */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[10px]">
            {["all", "formatters", "converters", "security", "generators"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-full capitalize transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-cyan-500/25 text-cyan-300 font-medium border border-cyan-500/40"
                    : "bg-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Tabs or Desktop Tool List */}
        <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 gap-1 scrollbar-none">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-all shrink-0 md:shrink md:w-full ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-cyan-400" : "text-neutral-400"
                  }`}
                />
                <div className="hidden md:block truncate flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{tool.name}</span>
                    {tool.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/20 font-mono">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>
                <span className="md:hidden whitespace-nowrap">{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="hidden md:flex mt-auto p-3 border-t border-white/10 text-[10px] text-neutral-500 flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Engine</span>
          </div>
          <span>Offline safe &bull; No API calls &bull; GitHub Pages</span>
        </div>
      </div>

      {/* ─── MAIN TOOL WORKSPACE ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/10">
        {activeTool === "json" && (
          <JsonTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
        {activeTool === "base64" && (
          <Base64Tool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
        {activeTool === "hash" && (
          <HashTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
        {activeTool === "jwt" && (
          <JwtTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
        {activeTool === "uuid" && (
          <UuidTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
        {activeTool === "epoch" && (
          <EpochTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
            locale={locale}
          />
        )}
        {activeTool === "qrcode" && (
          <QrCodeTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
        {activeTool === "color" && (
          <ColorTool
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* TOOL 1: JSON FORMATTER & VALIDATOR                                        */
/* ========================================================================= */

const SAMPLE_JSON = `{
  "system": "RadjaOS Desktop Pro",
  "version": "2.4.08",
  "developer": "Radja Genta Saputra",
  "features": [
    "Frosted Glass Surfaces",
    "Radja Terminal Emulator",
    "Client-side DevTools",
    "Zero Trademark Look-Alike"
  ],
  "stats": {
    "uptime_years": 20,
    "coffee_cups": 1337,
    "matcha_latte": true
  }
}`;

function JsonTool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [indentSize, setIndentSize] = useState<2 | 4 | "tab">(2);
  const [stats, setStats] = useState({ chars: 0, bytes: 0, keys: 0 });

  const formatJson = (customIndent?: 2 | 4 | "tab") => {
    const indent = customIndent !== undefined ? customIndent : indentSize;
    if (!input.trim()) {
      setOutput("");
      setIsValid(true);
      setErrorMsg("");
      setStats({ chars: 0, bytes: 0, keys: 0 });
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const space = indent === "tab" ? "\t" : indent;
      const formatted = JSON.stringify(parsed, null, space);
      setOutput(formatted);
      setIsValid(true);
      setErrorMsg("");

      // Compute statistics
      const countKeys = (obj: unknown): number => {
        if (typeof obj !== "object" || obj === null) return 0;
        let count = Object.keys(obj).length;
        for (const k of Object.values(obj)) {
          count += countKeys(k);
        }
        return count;
      };

      setStats({
        chars: formatted.length,
        bytes: new Blob([formatted]).size,
        keys: countKeys(parsed),
      });
    } catch (err) {
      setIsValid(false);
      setErrorMsg((err as Error).message);
    }
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setErrorMsg("");
      setStats({
        chars: minified.length,
        bytes: new Blob([minified]).size,
        keys: stats.keys,
      });
    } catch (err) {
      setIsValid(false);
      setErrorMsg((err as Error).message);
    }
  };

  useEffect(() => {
    formatJson();
  }, [input, indentSize]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-3">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">JSON Formatter & Validator</h2>
          {isValid ? (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3 h-3" /> Valid JSON
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-3 h-3" /> Syntax Error
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(e.target.value === "tab" ? "tab" : Number(e.target.value) as 2 | 4)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-cyan-400"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value="tab">Tab</option>
          </select>
          <button
            onClick={minifyJson}
            className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
          >
            Minify
          </button>
          <button
            onClick={() => setInput(SAMPLE_JSON)}
            className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
          >
            Sample
          </button>
          <button
            onClick={() => {
              setInput("");
              setOutput("");
            }}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-rose-400 border border-white/10 transition-colors"
            title="Clear input"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
        {/* Raw Input */}
        <div className="flex flex-col min-h-[140px] border border-white/10 rounded-lg bg-black/40 overflow-hidden">
          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 text-[11px] font-medium text-neutral-400 flex justify-between items-center">
            <span>Raw Input</span>
            <span className="text-[10px] text-neutral-500">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw JSON here..."
            className="flex-1 p-3 bg-transparent text-xs font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none scrollbar-thin"
          />
        </div>

        {/* Formatted Output */}
        <div className="flex flex-col min-h-[140px] border border-white/10 rounded-lg bg-black/40 overflow-hidden relative">
          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 text-[11px] font-medium text-neutral-400 flex justify-between items-center">
            <span>Formatted Output</span>
            <button
              onClick={() => copyToClipboard(output, "json-out")}
              disabled={!output}
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-40"
            >
              {copiedKey === "json-out" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Output
                </>
              )}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Formatted output will appear here..."
            className="flex-1 p-3 bg-transparent text-xs font-mono text-cyan-300/90 resize-none focus:outline-none scrollbar-thin selection:bg-cyan-500/30"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-wrap items-center justify-between text-xs gap-2">
        {isValid ? (
          <div className="flex items-center gap-4 text-neutral-400 text-[11px]">
            <span>Size: <strong className="text-white">{stats.bytes} B</strong></span>
            <span>Keys: <strong className="text-white">{stats.keys}</strong></span>
            <span>Length: <strong className="text-white">{stats.chars}</strong></span>
          </div>
        ) : (
          <div className="text-rose-400 text-xs font-mono truncate">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* TOOL 2: BASE64 & URL CONVERTER                                            */
/* ========================================================================= */

function Base64Tool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [subMode, setSubMode] = useState<"text" | "url" | "image">("text");
  const [textInput, setTextInput] = useState("Hello, RadjaOS World!");
  const [textOutput, setTextOutput] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number } | null>(null);

  // Text Base64 encode/decode
  const encodeBase64 = () => {
    try {
      const encoded = btoa(
        encodeURIComponent(textInput).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
      setTextOutput(encoded);
    } catch {
      setTextOutput("Error encoding to Base64");
    }
  };

  const decodeBase64 = () => {
    try {
      const decoded = decodeURIComponent(
        atob(textInput.trim())
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      setTextOutput(decoded);
    } catch {
      setTextOutput("Error: Invalid Base64 string");
    }
  };

  // URL encode/decode
  const encodeUrl = () => {
    setTextOutput(encodeURIComponent(textInput));
  };

  const decodeUrl = () => {
    try {
      setTextOutput(decodeURIComponent(textInput));
    } catch {
      setTextOutput("Error: Invalid URL encoded string");
    }
  };

  // Image upload to Base64
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMeta({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (subMode === "text") encodeBase64();
    if (subMode === "url") encodeUrl();
  }, [subMode]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-3">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Base64 & URL Converter</h2>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setSubMode("text")}
            className={`px-2.5 py-1 text-xs rounded transition-all ${
              subMode === "text"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Base64 Text
          </button>
          <button
            onClick={() => setSubMode("url")}
            className={`px-2.5 py-1 text-xs rounded transition-all ${
              subMode === "url"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            URL Encode
          </button>
          <button
            onClick={() => setSubMode("image")}
            className={`px-2.5 py-1 text-xs rounded transition-all ${
              subMode === "image"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Image &rarr; Data URI
          </button>
        </div>
      </div>

      {subMode !== "image" ? (
        <>
          {/* Action Row */}
          <div className="flex items-center gap-2">
            {subMode === "text" ? (
              <>
                <button
                  onClick={encodeBase64}
                  className="px-3 py-1.5 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/30 transition-all"
                >
                  Encode to Base64
                </button>
                <button
                  onClick={decodeBase64}
                  className="px-3 py-1.5 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all"
                >
                  Decode Base64
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={encodeUrl}
                  className="px-3 py-1.5 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/30 transition-all"
                >
                  Encode URL
                </button>
                <button
                  onClick={decodeUrl}
                  className="px-3 py-1.5 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all"
                >
                  Decode URL
                </button>
              </>
            )}
            <button
              onClick={() => {
                const temp = textInput;
                setTextInput(textOutput);
                setTextOutput(temp);
              }}
              className="px-2.5 py-1.5 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 flex items-center gap-1 transition-all ml-auto"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
            </button>
          </div>

          {/* Editors */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
            <div className="flex flex-col border border-white/10 rounded-lg bg-black/40 overflow-hidden">
              <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 text-[11px] font-medium text-neutral-400">
                Input
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or paste text..."
                className="flex-1 p-3 bg-transparent text-xs font-mono text-neutral-200 resize-none focus:outline-none scrollbar-thin"
              />
            </div>

            <div className="flex flex-col border border-white/10 rounded-lg bg-black/40 overflow-hidden">
              <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 text-[11px] font-medium text-neutral-400 flex justify-between items-center">
                <span>Output</span>
                <button
                  onClick={() => copyToClipboard(textOutput, "b64-out")}
                  disabled={!textOutput}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 disabled:opacity-40"
                >
                  {copiedKey === "b64-out" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={textOutput}
                placeholder="Result will appear here..."
                className="flex-1 p-3 bg-transparent text-xs font-mono text-cyan-300/90 resize-none focus:outline-none scrollbar-thin selection:bg-cyan-500/30"
              />
            </div>
          </div>
        </>
      ) : (
        /* Image to Base64 */
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
          <label className="border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 transition-all">
            <Upload className="w-8 h-8 text-cyan-400" />
            <span className="text-xs font-medium text-white">Click or drag an image here to convert</span>
            <span className="text-[10px] text-neutral-400">Supports PNG, JPG, WebP, SVG</span>
            <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
          </label>

          {imageDataUrl && (
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-32 h-32 rounded-lg bg-black/40 border border-white/10 p-2 flex items-center justify-center shrink-0">
                <img src={imageDataUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded" />
              </div>

              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">{imageMeta?.name}</span>
                  <span className="text-[10px] text-neutral-400">
                    Original: {imageMeta ? (imageMeta.size / 1024).toFixed(1) : 0} KB
                  </span>
                </div>

                <textarea
                  readOnly
                  value={imageDataUrl}
                  className="w-full h-20 p-2 bg-black/40 border border-white/10 rounded text-[11px] font-mono text-cyan-300 resize-none focus:outline-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => copyToClipboard(imageDataUrl, "img-b64")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/30 transition-all"
                  >
                    {copiedKey === "img-b64" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied URI!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Data URI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* TOOL 3: HASH & CHECKSUM MACHINE                                           */
/* ========================================================================= */

function HashTool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [input, setInput] = useState("RadjaOS Desktop Pro");
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
  });

  useEffect(() => {
    let active = true;
    const compute = async () => {
      const md5 = computeMD5(input);
      const sha1 = await computeSubtleHash("SHA-1", input);
      const sha256 = await computeSubtleHash("SHA-256", input);
      const sha512 = await computeSubtleHash("SHA-512", input);

      if (active) {
        setHashes({
          md5: uppercase ? md5.toUpperCase() : md5,
          sha1: uppercase ? sha1.toUpperCase() : sha1,
          sha256: uppercase ? sha256.toUpperCase() : sha256,
          sha512: uppercase ? sha512.toUpperCase() : sha512,
        });
      }
    };
    compute();
    return () => {
      active = false;
    };
  }, [input, uppercase]);

  const hashItems = [
    { label: "MD5 (128-bit)", key: "md5", val: hashes.md5 },
    { label: "SHA-1 (160-bit)", key: "sha1", val: hashes.sha1 },
    { label: "SHA-256 (256-bit)", key: "sha256", val: hashes.sha256 },
    { label: "SHA-512 (512-bit)", key: "sha512", val: hashes.sha512 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-4 scrollbar-thin">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Hash & Checksum Machine</h2>
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded bg-white/10 border-white/20 text-cyan-400 focus:ring-0"
          />
          <span>Uppercase Hex</span>
        </label>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400">Plaintext Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type text to generate hashes in realtime..."
          rows={3}
          className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-neutral-200 resize-none focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Hashes List */}
      <div className="flex flex-col gap-3">
        {hashItems.map((item) => (
          <div key={item.key} className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
              <span>{item.label}</span>
              <button
                onClick={() => copyToClipboard(item.val, `hash-${item.key}`)}
                className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedKey === `hash-${item.key}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Hash
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-cyan-300 break-all select-all py-1">
              {item.val || "..."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* TOOL 4: JWT INSPECTOR                                                     */
/* ========================================================================= */

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJhZGphIEdlbnRhIFNhcHV0cmEiLCJyb2xlIjoiSnVuaW9yIEZ1bGwgU3RhY2sgRGV2ZWxvcGVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.4pe0i2pB_GZq3uA4r2i4s2B1e3i4s_GZq3uA4r2i4s2";

function JwtTool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [decoded, setDecoded] = useState<DecodedJWT>(() => decodeJWT(SAMPLE_JWT));

  useEffect(() => {
    setDecoded(decodeJWT(token));
  }, [token]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-4 scrollbar-thin">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">JWT Token Inspector</h2>
          {decoded.error ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Invalid Token
            </span>
          ) : decoded.isExpired ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Expired
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Valid Signature Structure
            </span>
          )}
        </div>

        <button
          onClick={() => setToken(SAMPLE_JWT)}
          className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
        >
          Sample Token
        </button>
      </div>

      {/* Raw JWT Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400">Encoded Token (Header.Payload.Signature)</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste encoded JWT here..."
          rows={3}
          className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-cyan-300/90 resize-none focus:outline-none focus:border-cyan-400 break-all"
        />
      </div>

      {decoded.error ? (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-mono">
          {decoded.error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Header */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
              <span>Header: Algorithm & Token Type</span>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(decoded.header, null, 2), "jwt-h")
                }
                className="text-[10px] text-neutral-400 hover:text-white"
              >
                {copiedKey === "jwt-h" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-2 rounded bg-black/40 text-xs font-mono text-neutral-200 overflow-x-auto scrollbar-thin">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Payload: Data Claims</span>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(decoded.payload, null, 2), "jwt-p")
                }
                className="text-[10px] text-neutral-400 hover:text-white"
              >
                {copiedKey === "jwt-p" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-2 rounded bg-black/40 text-xs font-mono text-neutral-200 overflow-x-auto scrollbar-thin">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Claims Breakdown */}
      {decoded.payload && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
          <span className="text-xs font-semibold text-white">Time & Claims Information</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
            <div className="p-2 rounded bg-black/30 border border-white/5">
              <span className="text-neutral-500 block text-[10px]">Issued At (iat):</span>
              <strong className="text-white">{decoded.issuedAtFormatted || "Not specified"}</strong>
            </div>
            <div className="p-2 rounded bg-black/30 border border-white/5">
              <span className="text-neutral-500 block text-[10px]">Expires At (exp):</span>
              <strong className={decoded.isExpired ? "text-rose-400" : "text-emerald-400"}>
                {decoded.expiresAtFormatted || "Never expires"}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* TOOL 5: UUID & SECURE TOKEN GENERATOR                                      */
/* ========================================================================= */

function UuidTool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  // Password Generator
  const [passLength, setPassLength] = useState(24);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generatedPass, setGeneratedPass] = useState("");

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id: string = window.crypto.randomUUID();
      if (noHyphens) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  };

  const generatePass = () => {
    const pass = generateSecureToken(passLength, {
      uppercase: useUpper,
      lowercase: useLower,
      numbers: useNumbers,
      symbols: useSymbols,
    });
    setGeneratedPass(pass);
  };

  useEffect(() => {
    generateUuids();
    generatePass();
  }, [count, uppercase, noHyphens]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-5 scrollbar-thin">
      {/* UUID Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">UUID v4 Batch Generator</h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-cyan-400"
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
              <option value={25}>25 UUIDs</option>
            </select>
            <button
              onClick={generateUuids}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/30 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
            <button
              onClick={() => copyToClipboard(uuids.join("\n"), "uuid-all")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all"
            >
              {copiedKey === "uuid-all" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied All
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-cyan-400 focus:ring-0"
            />
            <span>Uppercase</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={noHyphens}
              onChange={(e) => setNoHyphens(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-cyan-400 focus:ring-0"
            />
            <span>Strip Hyphens</span>
          </label>
        </div>

        {/* UUID List */}
        <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex flex-col gap-1.5 max-h-48 overflow-y-auto font-mono text-xs text-neutral-200">
          {uuids.map((id, idx) => (
            <div key={idx} className="flex items-center justify-between hover:bg-white/5 px-2 py-1 rounded">
              <span className="text-cyan-300">{id}</span>
              <button
                onClick={() => copyToClipboard(id, `uuid-${idx}`)}
                className="text-[10px] text-neutral-500 hover:text-white"
              >
                {copiedKey === `uuid-${idx}` ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Secure Password Generator */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">High-Entropy Random Token Generator</h3>
          </div>
          <button
            onClick={generatePass}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Re-roll
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/10">
          <input
            type="text"
            readOnly
            value={generatedPass}
            className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-emerald-400 tracking-wider focus:outline-none select-all"
          />
          <button
            onClick={() => copyToClipboard(generatedPass, "pass-gen")}
            className="px-3 py-1.5 text-xs rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1"
          >
            {copiedKey === "pass-gen" ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Sliders and Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span>Token Length:</span>
              <strong className="text-cyan-400">{passLength} characters</strong>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={passLength}
              onChange={(e) => {
                setPassLength(Number(e.target.value));
                generatePass();
              }}
              className="accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="accent-cyan-400" />
              <span>A-Z</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="accent-cyan-400" />
              <span>a-z</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="accent-cyan-400" />
              <span>0-9</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="accent-cyan-400" />
              <span>!@#$</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* TOOL 6: UNIX EPOCH TIMESTAMP CONVERTER                                    */
/* ========================================================================= */

function EpochTool({
  copyToClipboard,
  copiedKey,
  locale,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
  locale: Locale;
}) {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState(String(Math.floor(Date.now() / 1000)));
  const [humanDate, setHumanDate] = useState("");
  const [utcDate, setUtcDate] = useState("");

  // Live ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert input epoch to human date
  useEffect(() => {
    const num = Number(inputEpoch);
    if (!isNaN(num) && num > 0) {
      // detect if milliseconds (e.g. > 10000000000)
      const ms = num > 1e11 ? num : num * 1000;
      const date = new Date(ms);
      const tag = locale === "id" ? "id-ID" : locale === "ja" ? "ja-JP" : "en-US";
      setHumanDate(
        date.toLocaleString(tag, {
          timeZone: "Asia/Jakarta",
          dateStyle: "full",
          timeStyle: "long",
        })
      );
      setUtcDate(date.toUTCString());
    } else {
      setHumanDate("Invalid timestamp");
      setUtcDate("Invalid timestamp");
    }
  }, [inputEpoch, locale]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-5 scrollbar-thin">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Clock className="w-5 h-5 text-cyan-400" />
        <h2 className="text-sm font-semibold text-white">Unix Epoch Timestamp Converter</h2>
      </div>

      {/* Realtime Live Ticker */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col text-center sm:text-left">
          <span className="text-[11px] text-cyan-300 font-medium">Current Unix Timestamp</span>
          <span className="text-2xl font-mono font-bold text-white tracking-wider">{currentEpoch}</span>
        </div>
        <button
          onClick={() => copyToClipboard(String(currentEpoch), "live-epoch")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/30 transition-all"
        >
          {copiedKey === "live-epoch" ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy Epoch
            </>
          )}
        </button>
      </div>

      {/* Epoch to Human Date */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-xs font-semibold text-white">Convert Timestamp to Date</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputEpoch}
            onChange={(e) => setInputEpoch(e.target.value)}
            placeholder="Enter seconds or milliseconds..."
            className="flex-1 p-2 bg-black/40 border border-white/10 rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => setInputEpoch(String(Math.floor(Date.now() / 1000)))}
            className="px-3 py-2 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all"
          >
            Now
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded bg-black/30 border border-white/5">
            <span className="text-neutral-500 block text-[10px]">Local Time (WIB UTC+7):</span>
            <strong className="text-cyan-300 text-xs sm:text-sm">{humanDate}</strong>
          </div>
          <div className="p-2.5 rounded bg-black/30 border border-white/5">
            <span className="text-neutral-500 block text-[10px]">UTC Time (GMT):</span>
            <strong className="text-emerald-300 text-xs sm:text-sm">{utcDate}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* TOOL 7: QR CODE STUDIO                                                    */
/* ========================================================================= */

function QrCodeTool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [text, setText] = useState("https://github.com/radjashiqnals");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [correctionLevel, setCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(220);

  useEffect(() => {
    let active = true;
    const generate = async () => {
      if (!text.trim()) {
        setQrDataUrl("");
        return;
      }
      try {
        const url = await QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          errorCorrectionLevel: correctionLevel,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        if (active) setQrDataUrl(url);
      } catch (err) {
        console.error("QR Code Error:", err);
      }
    };
    generate();
    return () => {
      active = false;
    };
  }, [text, correctionLevel, size]);

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "radjaos-qrcode.png";
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-4 scrollbar-thin">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <QrCode className="w-5 h-5 text-cyan-400" />
        <h2 className="text-sm font-semibold text-white">QR Code Studio</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">Content / URL to Encode</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              rows={4}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-neutral-200 resize-none focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-neutral-400">Resolution Size</label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white"
              >
                <option value={160}>Small (160px)</option>
                <option value={220}>Medium (220px)</option>
                <option value={300}>Large (300px)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400">Error Correction</label>
              <select
                value={correctionLevel}
                onChange={(e) => setCorrectionLevel(e.target.value as "L" | "M" | "Q" | "H")}
                className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 border border-white/10 gap-4">
          <div className="p-3 bg-white rounded-xl shadow-lg shadow-black/50">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Generated QR" className="rounded" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-neutral-400 text-xs">
                No Data
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadQr}
              disabled={!qrDataUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-500/30 transition-all disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Download PNG
            </button>
            <button
              onClick={() => copyToClipboard(qrDataUrl, "qr-uri")}
              disabled={!qrDataUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all disabled:opacity-40"
            >
              {copiedKey === "qr-uri" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied URI
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Data URI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* TOOL 8: COLOR STUDIO & WCAG CONTRAST TESTER                               */
/* ========================================================================= */

function ColorTool({
  copyToClipboard,
  copiedKey,
}: {
  copyToClipboard: (t: string, k?: string) => void;
  copiedKey: string | null;
}) {
  const [hexColor, setHexColor] = useState("#0078d4");
  const [bgHex, setBgHex] = useState("#000000");

  const contrast = calculateContrastRatio(hexColor, bgHex);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-5 scrollbar-thin">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Palette className="w-5 h-5 text-cyan-400" />
        <h2 className="text-sm font-semibold text-white">Color Studio & WCAG Contrast Tester</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color 1 Picker (Text/Foreground) */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
          <span className="text-xs font-semibold text-white">Foreground / Text Color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="flex-1 p-2 rounded bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => copyToClipboard(hexColor, "fg-hex")}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              {copiedKey === "fg-hex" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Color 2 Picker (Background) */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
          <span className="text-xs font-semibold text-white">Background Color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgHex}
              onChange={(e) => setBgHex(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={bgHex}
              onChange={(e) => setBgHex(e.target.value)}
              className="flex-1 p-2 rounded bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => copyToClipboard(bgHex, "bg-hex")}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              {copiedKey === "bg-hex" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Contrast Results Card */}
      <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">WCAG Contrast Ratio:</span>
            <span className="text-3xl font-bold font-mono text-white">{contrast.ratio} : 1</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`px-2.5 py-1 rounded font-medium border ${
                contrast.scoreAA
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              AA Normal ({contrast.scoreAA ? "Pass" : "Fail"})
            </span>
            <span
              className={`px-2.5 py-1 rounded font-medium border ${
                contrast.scoreAAA
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              AAA Normal ({contrast.scoreAAA ? "Pass" : "Fail"})
            </span>
          </div>
        </div>

        {/* Live Preview Box */}
        <div
          className="p-6 rounded-xl border border-white/10 flex flex-col gap-1 transition-colors"
          style={{ backgroundColor: bgHex, color: hexColor }}
        >
          <span className="text-base font-bold">The quick brown fox jumps over the lazy dog.</span>
          <span className="text-xs opacity-90">
            Previewing readability under current contrast ratio ({contrast.ratio}:1) in RadjaOS.
          </span>
        </div>
      </div>
    </div>
  );
}
