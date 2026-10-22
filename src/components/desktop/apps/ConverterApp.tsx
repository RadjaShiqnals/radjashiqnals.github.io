import React, { useState, useMemo } from "react";
import type { Locale } from "../../../lib/i18n";
import { Copy, Check, ArrowRight } from "lucide-react";
import YAML from "yaml";
import * as TOML from "smol-toml";

interface ConverterAppProps {
  locale: Locale;
}

type InputFormat = "json" | "yaml" | "toml";
type OutputFormat = "typescript" | "zod" | "json" | "yaml" | "toml";

const COMPATIBILITY_MAP: Record<InputFormat, OutputFormat[]> = {
  json: ["typescript", "zod", "yaml", "toml"],
  yaml: ["json", "typescript", "zod", "toml"],
  toml: ["json", "typescript", "zod", "yaml"],
};

function inferTsType(value: unknown, indent = 2): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const elemType = inferTsType(value[0], indent);
    return `${elemType}[]`;
  }

  if (typeof value === "object") {
    const spaces = " ".repeat(indent);
    const innerSpaces = " ".repeat(indent + 2);
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${innerSpaces}${k}: ${inferTsType(v, indent + 2)};`
    );
    return `{\n${entries.join("\n")}\n${spaces}}`;
  }

  return "unknown";
}

function inferZodSchema(value: unknown, indent = 2): string {
  if (value === null) return "z.null()";
  if (value === undefined) return "z.undefined()";
  if (typeof value === "string") return "z.string()";
  if (typeof value === "number") return "z.number()";
  if (typeof value === "boolean") return "z.boolean()";

  if (Array.isArray(value)) {
    if (value.length === 0) return "z.array(z.unknown())";
    return `z.array(${inferZodSchema(value[0], indent)})`;
  }

  if (typeof value === "object") {
    const spaces = " ".repeat(indent);
    const innerSpaces = " ".repeat(indent + 2);
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${innerSpaces}${k}: ${inferZodSchema(v, indent + 2)},`
    );
    return `z.object({\n${entries.join("\n")}\n${spaces}})`;
  }

  return "z.unknown()";
}

const DEFAULT_JSON = `{
  "id": "radjaos-101",
  "name": "RadjaOS Desktop",
  "version": 2.5,
  "isProduction": true,
  "author": {
    "name": "Radja Genta",
    "location": "East Java",
    "skills": ["TypeScript", "Laravel", "React"]
  }
}`;

export const ConverterApp: React.FC<ConverterAppProps> = () => {
  const [inputFormat, setInputFormat] = useState<InputFormat>("json");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("typescript");
  const [input, setInput] = useState<string>(DEFAULT_JSON);
  const [copied, setCopied] = useState(false);

  // Parse input to standard JavaScript Object IR
  const { ir, parseError } = useMemo(() => {
    if (!input.trim()) return { ir: null, parseError: null };
    try {
      if (inputFormat === "json") {
        return { ir: JSON.parse(input), parseError: null };
      }
      if (inputFormat === "yaml") {
        return { ir: YAML.parse(input), parseError: null };
      }
      if (inputFormat === "toml") {
        return { ir: TOML.parse(input), parseError: null };
      }
      return { ir: null, parseError: "Unsupported input format" };
    } catch (err) {
      return { ir: null, parseError: String(err) };
    }
  }, [input, inputFormat]);

  // Convert IR to desired Output
  const output = useMemo(() => {
    if (parseError) return `// Parse Error:\n// ${parseError}`;
    if (ir === null) return "";

    try {
      if (outputFormat === "typescript") {
        return `export interface RootSchema ${inferTsType(ir)}\n`;
      }
      if (outputFormat === "zod") {
        return `import { z } from "zod";\n\nexport const RootSchema = ${inferZodSchema(ir)};\nexport type Root = z.infer<typeof RootSchema>;\n`;
      }
      if (outputFormat === "json") {
        return JSON.stringify(ir, null, 2);
      }
      if (outputFormat === "yaml") {
        return YAML.stringify(ir);
      }
      if (outputFormat === "toml") {
        if (typeof ir !== "object" || ir === null || Array.isArray(ir)) {
          return "# TOML requires a root object/dictionary\n";
        }
        return TOML.stringify(ir as Record<string, unknown>);
      }
      return "";
    } catch (err) {
      return `// Output generation error:\n// ${String(err)}`;
    }
  }, [ir, parseError, outputFormat]);

  // Check valid options for current input format
  const validOutputs = COMPATIBILITY_MAP[inputFormat];

  const handleInputFormatChange = (fmt: InputFormat) => {
    setInputFormat(fmt);
    const allowed = COMPATIBILITY_MAP[fmt];
    if (!allowed.includes(outputFormat)) {
      setOutputFormat(allowed[0]);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#141414]/95 text-neutral-200 select-none overflow-hidden">
      {/* Top Format Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-3">
          {/* Input Format Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">From:</span>
            <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
              {(["json", "yaml", "toml"] as InputFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleInputFormatChange(fmt)}
                  className={`px-2.5 py-1 rounded text-xs uppercase font-mono font-medium transition-colors cursor-pointer ${
                    inputFormat === fmt
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-neutral-500 hidden sm:block" />

          {/* Output Format Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">To:</span>
            <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
              {(["typescript", "zod", "json", "yaml", "toml"] as OutputFormat[]).map((fmt) => {
                const isValid = validOutputs.includes(fmt);
                return (
                  <button
                    key={fmt}
                    disabled={!isValid}
                    onClick={() => setOutputFormat(fmt)}
                    title={!isValid ? `${inputFormat.toUpperCase()} cannot output to ${fmt.toUpperCase()}` : undefined}
                    className={`px-2.5 py-1 rounded text-xs capitalize font-medium transition-colors ${
                      outputFormat === fmt
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-pointer"
                        : isValid
                        ? "text-neutral-400 hover:text-white cursor-pointer"
                        : "text-neutral-600 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {fmt === "typescript" ? "TypeScript" : fmt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyOutput}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Output"}</span>
        </button>
      </div>

      {/* Split Panes */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Input Textarea */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              {inputFormat.toUpperCase()} Source
            </span>
            {parseError && <span className="text-[10px] text-red-400 font-mono">Syntax error</span>}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 w-full bg-transparent resize-none font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none leading-relaxed select-text"
          />
        </div>

        {/* Output Textarea */}
        <div className="flex-1 flex flex-col bg-black/40 p-3">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            {outputFormat === "typescript" ? "TypeScript Interface" : outputFormat.toUpperCase()} Output
          </span>
          <textarea
            readOnly
            value={output}
            className="flex-1 w-full bg-transparent resize-none font-mono text-xs text-cyan-300 focus:outline-none leading-relaxed select-text"
          />
        </div>
      </div>
    </div>
  );
};
