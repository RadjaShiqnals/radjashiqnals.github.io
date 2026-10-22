import React, { useState, useEffect, useRef } from "react";
import type { Locale } from "../../../lib/i18n";
import { FolderOpen, Save, FileCode, Plus, Trash2, Check } from "lucide-react";
import * as monaco from "monaco-editor";

interface CodeStudioAppProps {
  locale: Locale;
}

interface EditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

const DEFAULT_FILES: EditorFile[] = [
  {
    id: "main.ts",
    name: "main.ts",
    language: "typescript",
    content: `// RadjaOS Code Studio - TypeScript Environment
interface Developer {
  name: string;
  role: string;
  skills: string[];
}

const dev: Developer = {
  name: "Radja Genta",
  role: "Full Stack Developer & Tech Lead",
  skills: ["TypeScript", "Laravel", "React", "Astro"]
};

console.log(\`Ready to build with \${dev.name}!\`);
`,
  },
  {
    id: "styles.css",
    name: "styles.css",
    language: "css",
    content: `/* RadjaOS Design System Surface */
.acrylic-surface {
  backdrop-filter: blur(24px);
  background: rgba(20, 20, 20, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
`,
  },
  {
    id: "config.json",
    name: "config.json",
    language: "json",
    content: `{
  "os": "RadjaOS",
  "version": "2.5.0",
  "offlineSafe": true,
  "telemetry": false
}
`,
  },
];

export const CodeStudioApp: React.FC<CodeStudioAppProps> = () => {
  const [files, setFiles] = useState<EditorFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("main.ts");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loadingMonaco, setLoadingMonaco] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorInstanceRef = useRef<any>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Initialize Monaco Editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Custom VS Dark theme tuning
      monaco.editor.defineTheme("radja-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#141414",
          "editor.lineHighlightBackground": "#1e1e1e",
          "editorLineNumber.foreground": "#555555",
          "editorLineNumber.activeForeground": "#60cdff",
        },
      });

      const instance = monaco.editor.create(containerRef.current, {
        value: activeFile.content,
        language: activeFile.language,
        theme: "radja-dark",
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        tabSize: 2,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        padding: { top: 12, bottom: 12 },
      });

      instance.onDidChangeModelContent(() => {
        const newContent = instance.getValue();
        setFiles((prev) =>
          prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
        );
      });

      editorInstanceRef.current = instance;
      setLoadingMonaco(false);
    } catch (err) {
      console.error("Monaco load error:", err);
      setLoadingMonaco(false);
    }

    return () => {
      editorInstanceRef.current?.dispose();
      editorInstanceRef.current = null;
    };
  }, []);

  // Update editor model when switching files
  useEffect(() => {
    if (!editorInstanceRef.current) return;
    const currentVal = editorInstanceRef.current.getValue();
    if (currentVal !== activeFile.content) {
      editorInstanceRef.current.setValue(activeFile.content);
    }
    const model = editorInstanceRef.current.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, activeFile.language);
    }
  }, [activeFileId]);

  // Open file from local filesystem
  const openLocalFile = async () => {
    try {
      // Chromium File System Access API
      if ("showOpenFilePicker" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [handle] = await (window as any).showOpenFilePicker();
        const file = await handle.getFile();
        const text = await file.text();
        const ext = file.name.split(".").pop() || "txt";
        let lang = "plaintext";
        if (["js", "jsx", "ts", "tsx"].includes(ext)) lang = "typescript";
        else if (ext === "json") lang = "json";
        else if (ext === "css") lang = "css";
        else if (ext === "html") lang = "html";

        const newFile: EditorFile = {
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          language: lang,
          content: text,
        };

        setFiles((prev) => [...prev, newFile]);
        setActiveFileId(newFile.id);
      } else {
        // Fallback input
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;
          const text = await file.text();
          const newFile: EditorFile = {
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            language: "plaintext",
            content: text,
          };
          setFiles((prev) => [...prev, newFile]);
          setActiveFileId(newFile.id);
        };
        input.click();
      }
    } catch {
      // User cancelled picker
    }
  };

  // Save active file
  const saveFile = () => {
    try {
      const blob = new Blob([activeFile.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
      setSaveStatus("Saved to disk");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus("Save error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const createNewFile = () => {
    const count = files.length + 1;
    const newFile: EditorFile = {
      id: `file-${count}.ts`,
      name: `script-${count}.ts`,
      language: "typescript",
      content: `// New script\nconsole.log("Hello from script ${count}");\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const closeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) return;
    const nextFiles = files.filter((f) => f.id !== id);
    setFiles(nextFiles);
    if (activeFileId === id) {
      setActiveFileId(nextFiles[0].id);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <button
            onClick={openLocalFile}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open</span>
          </button>

          <button
            onClick={saveFile}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save</span>
          </button>

          <button
            onClick={createNewFile}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="New file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {saveStatus && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{saveStatus}</span>
          </span>
        )}

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
          <span>{activeFile.language}</span>
          <span>&bull;</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* File Tabs Strip */}
      <div className="flex items-center gap-1 px-2 pt-1 border-b border-white/10 bg-black/20 overflow-x-auto scrollbar-none">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono transition-colors cursor-pointer border-t border-x ${
                isActive
                  ? "bg-[#141414] text-cyan-300 border-white/15"
                  : "bg-transparent text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-white/5"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-neutral-400" />
              <span>{file.name}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => closeFile(file.id, e)}
                  className="p-0.5 rounded hover:bg-white/10 text-neutral-500 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative w-full h-full bg-[#141414] overflow-hidden">
        {loadingMonaco && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#141414] text-neutral-400 text-xs font-mono">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Code Studio engine...</span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
