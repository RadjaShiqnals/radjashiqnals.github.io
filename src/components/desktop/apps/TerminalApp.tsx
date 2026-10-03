import React, { useState, useRef, useEffect } from "react";
import { type Locale, t, getRandomMommyQuote } from "../../../lib/i18n";
import { playErrorBeep } from "../../../lib/sound";
import { Terminal as TerminalIcon, Plus, ChevronDown, X } from "lucide-react";

interface TerminalAppProps {
  locale: Locale;
  onOpenProjects: () => void;
  onTriggerBSOD: () => void;
  onOpenTools?: () => void;
}

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  locale,
  onOpenProjects,
  onTriggerBSOD,
  onOpenTools,
}) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: "welcome",
      output: (
        <div className="text-neutral-400 space-y-1">
          <p className="text-cyan-400 font-bold">RadjaOS Workstation Shell v2.4 [Release x64]</p>
          <p>{t("terminal.welcome", locale)}</p>
          <p className="text-neutral-500 text-[11px]">{t("terminal.helpHint", locale)}</p>
        </div>
      ),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableCommands = [
    { name: "fetch", desc: "Display RadjaOS system specifications" },
    { name: "help", desc: "List all available shell commands" },
    { name: "tools", desc: "Launch offline developer utilities" },
    { name: "projects", desc: "Open featured projects portfolio" },
    { name: "whoami", desc: "Print current logged in developer identity" },
    { name: "mommy", desc: "Mommy ASMR comfort & encouragement" },
    { name: "sudo", desc: "Elevate shell privilege (satirical)" },
    { name: "clear", desc: "Clear terminal buffer" },
    { name: "rm -rf /", desc: "Simulate kernel panic disaster" },
  ];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    if (lower === "clear" || lower === "cls") {
      setHistory([]);
      setInput("");
      return;
    }

    if (
      lower === "rm -rf /" ||
      lower === "sudo rm -rf /" ||
      lower === "rm -rf" ||
      lower === "del /f /s /q c:\\"
    ) {
      playErrorBeep();
      onTriggerBSOD();
      return;
    }

    let outputNode: React.ReactNode = null;

    if (lower === "secret") {
      outputNode = (
        <span className="text-pink-400">
          Tip: 'secret' has been moved! Try typing <span className="font-bold underline">mommy</span> for ASMR comfort 💕
        </span>
      );
      setHistory((prev) => [...prev, { command: trimmed, output: outputNode }]);
      setInput("");
      return;
    }

    if (lower === "help" || lower === "get-help") {
      outputNode = (
        <div className="space-y-1.5 text-xs text-neutral-300 pt-1">
          <p className="text-cyan-400 font-semibold">{t("terminal.availableCommands", locale)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {availableCommands.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="font-mono text-cyan-300 font-bold w-20">{c.name}</span>
                <span className="text-neutral-500 text-[11px]">— {c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (
      lower === "fetch" ||
      lower === "neofetch" ||
      lower === "fastfetch" ||
      lower === "sysinfo" ||
      lower === "winfetch"
    ) {
      outputNode = (
        <div className="flex flex-col sm:flex-row gap-5 font-mono text-xs text-neutral-300 pt-2 pb-1">
          {/* RadjaOS 4-Tile Geometric ASCII Glyph */}
          <div className="select-none flex flex-col justify-start shrink-0 pt-1">
            <pre className="text-cyan-400 font-bold text-xs leading-tight tracking-normal">
{`  ███████   ███████
  ███████   ███████
  ███████   ███████

  ███████   ███████
  ███████   ███████
  ███████   ███████`}
            </pre>
          </div>

          <div className="space-y-1 text-xs">
            <p className="text-white font-bold tracking-wide">
              radja<span className="text-cyan-400">@</span>radjaos-pro
            </p>
            <p className="text-neutral-600">------------------------------------</p>
            <p>
              <span className="text-cyan-400 font-semibold">OS:</span> RadjaOS Desktop Pro 64-bit (Build 2408)
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Host:</span> SIDIGS Precision Workstation
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Role:</span> Junior Full Stack Developer
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Kernel:</span> RadjaOS Microkernel v2.4 (x86_64)
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Uptime:</span> 20 Years in this world
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Shell:</span> RadjaShell (Oh My Posh Engine)
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Terminal:</span> Radja Terminal Emulator
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">CPU:</span> Intel Core i5-11400H @ 2.70GHz (12 CPUs)
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">GPU:</span> NVIDIA GeForce RTX 3050 Laptop GPU
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Memory:</span> 3840MiB / 4096MiB (94% - node_modules & vite)
            </p>
            <p>
              <span className="text-cyan-400 font-semibold">Theme:</span> Obsidian Dark (Frosted Glass Active)
            </p>

            {/* ANSI Palette Dots */}
            <div className="flex items-center gap-1.5 pt-2 select-none">
              <span className="w-3 h-3 rounded-full bg-neutral-900 inline-block border border-white/10" />
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-white inline-block" />
            </div>
          </div>
        </div>
      );
    } else if (lower === "whoami") {
      outputNode = (
        <div className="text-neutral-300 space-y-0.5">
          <p className="text-cyan-300 font-semibold">Radja Genta Saputra</p>
          <p className="text-neutral-400 text-[11px]">Junior Full Stack Developer & Tech Lead at SIDIGS • East Java, Indonesia</p>
        </div>
      );
    } else if (lower === "date") {
      outputNode = (
        <span className="text-neutral-300">
          {new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })} WIB (UTC+7)
        </span>
      );
    } else if (lower === "ls" || lower === "dir") {
      outputNode = (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-300 py-1">
          <span className="text-blue-400 font-bold">AboutMe/</span>
          <span className="text-amber-400 font-bold">Projects/</span>
          <span className="text-emerald-400 font-bold">Skills/</span>
          <span className="text-cyan-400 font-bold">Experience/</span>
          <span className="text-pink-400 font-bold">Tools/</span>
          <span className="text-purple-400 font-bold">Settings/</span>
          <span className="text-neutral-500 font-bold">RecycleBin/</span>
          <span className="text-neutral-400">README.md</span>
        </div>
      );
    } else if (lower === "projects") {
      onOpenProjects();
      outputNode = <span className="text-cyan-400">Launching Projects application...</span>;
    } else if (lower === "tools" || lower === "devtoys" || lower === "utilitas") {
      if (onOpenTools) onOpenTools();
      outputNode = <span className="text-cyan-400">Launching RadjaOS Tools suite...</span>;
    } else if (lower.startsWith("sudo")) {
      outputNode = (
        <span className="text-amber-400">
          [sudo] authentication token for radja: **********<br />
          radja is running with elevated local rights. Incident logged gracefully.
        </span>
      );
    } else if (lower === "mommy" || lower === "mommy asmr") {
      const quote = getRandomMommyQuote(locale);
      outputNode = (
        <div className="p-3 rounded-lg bg-pink-950/40 border border-pink-500/30 text-pink-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-pink-400">
            <span>💖 Mommy ASMR Comfort</span>
          </div>
          <p className="italic leading-relaxed">"{quote}"</p>
        </div>
      );
    } else {
      playErrorBeep();
      outputNode = (
        <span className="text-rose-400">
          command not found: '{trimmed}'. Type <span className="underline font-bold text-cyan-300 cursor-pointer" onClick={() => executeCommand("help")}>help</span> to view available commands.
        </span>
      );
    }

    setHistory((prev) => [...prev, { command: trimmed, output: outputNode }]);
    setInput("");
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  return (
    <div
      className="h-full flex flex-col font-mono text-xs bg-[#141414]/95 -m-5 rounded-b-lg overflow-hidden cursor-text select-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Windows Terminal Look-Alike Tab Header */}
      <div className="h-8 shrink-0 bg-[#1a1a1a] border-b border-white/10 flex items-center px-2 gap-1 select-none">
        {/* Active Tab */}
        <div className="h-7 px-3 bg-[#141414] border-t-2 border-t-cyan-400 border-x border-white/10 rounded-t flex items-center gap-2 text-neutral-200 text-[11px] font-sans">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium tracking-wide">RadjaShell</span>
          <button
            type="button"
            className="w-3.5 h-3.5 rounded hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setHistory([]);
            }}
            title="Reset Buffer"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* New Tab Button */}
        <button
          type="button"
          className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="New Tab (Emulated)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Chevron */}
        <button
          type="button"
          className="w-5 h-6 rounded hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Shell Profiles"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Terminal Output Log */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 pb-2">
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            {h.command !== "welcome" && (
              <div className="space-y-0.5 font-mono text-xs">
                {/* Oh My Posh Segment Top Line */}
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-neutral-500">╭─</span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">
                    radja-sh
                  </span>
                  <span className="text-neutral-600">─</span>
                  <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-white/10 text-[10px]">
                    ~\RadjaOS
                  </span>
                  <span className="text-neutral-600">─</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[10px]">
                    git:(main)
                  </span>
                </div>
                {/* Command Line */}
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-cyan-400 font-bold select-none">╰─$</span>
                  <span className="text-white font-medium">{h.command}</span>
                </div>
              </div>
            )}
            <div className="pl-0">{h.output}</div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Autocomplete / Command Suggestion Pills */}
      <div className="px-4 py-1.5 border-t border-white/10 bg-[#161616]/90 flex flex-wrap items-center gap-1.5 select-none">
        <span className="text-[10px] text-neutral-500 mr-1">Suggestions:</span>
        {availableCommands.map((cmd) => (
          <button
            key={cmd.name}
            type="button"
            onClick={() => executeCommand(cmd.name)}
            className="px-2 py-0.5 rounded text-[10px] bg-neutral-800/80 hover:bg-cyan-600/30 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
            title={cmd.desc}
          >
            {cmd.name}
          </button>
        ))}
      </div>

      {/* Oh My Posh Interactive Prompt Form */}
      <form onSubmit={handleSubmit} className="p-3 pt-2 border-t border-white/10 bg-[#121212] space-y-1">
        {/* Segmented Badge Bar */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-neutral-500 text-xs">╭─</span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">
            radja-sh
          </span>
          <span className="text-neutral-600">─</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-white/10 text-[10px]">
            ~\RadjaOS
          </span>
          <span className="text-neutral-600">─</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[10px]">
            git:(main)
          </span>
        </div>

        {/* Input Row */}
        <div className="flex items-center gap-2 pl-2">
          <span className="text-cyan-400 font-bold select-none">╰─$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type a command (e.g. fetch, help, whoami)..."
            autoFocus
            className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-neutral-600 font-mono text-xs caret-cyan-400"
          />
        </div>
      </form>
    </div>
  );
};
