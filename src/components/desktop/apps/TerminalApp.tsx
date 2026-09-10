import React, { useState, useRef, useEffect } from "react";
import { type Locale, t, getRandomMommyQuote } from "../../../lib/i18n";
import { playErrorBeep } from "../../../lib/sound";

interface TerminalAppProps {
  locale: Locale;
  onOpenProjects: () => void;
  onTriggerBSOD: () => void;
}

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  locale,
  onOpenProjects,
  onTriggerBSOD,
}) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: "welcome",
      output: (
        <div className="text-neutral-400 space-y-1">
          <p className="text-emerald-400 font-bold">RadjaOS Kernel v4.0.0-cachyos-x86_64</p>
          <p>{t("terminal.welcome", locale)}</p>
          <p className="text-neutral-500 text-[11px]">{t("terminal.helpHint", locale)}</p>
        </div>
      ),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableCommands = [
    { name: "neofetch", desc: "Display system specifications" },
    { name: "help", desc: "List all available commands" },
    { name: "projects", desc: "Open Projects portfolio application" },
    { name: "sudo", desc: "Elevate privilege (satirical)" },
    { name: "rm -rf /", desc: "Do NOT run this unless you want chaos" },
    { name: "mommy", desc: "Mommy ASMR comfort & encouragement" },
    { name: "clear", desc: "Clear terminal buffer" },
  ];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    if (lower === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    if (lower === "rm -rf /" || lower === "sudo rm -rf /") {
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

    if (lower === "help") {
      outputNode = (
        <div className="space-y-1 text-xs text-neutral-300">
          <p className="text-blue-400 font-semibold">{t("terminal.availableCommands", locale)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
            {availableCommands.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold w-24">{c.name}</span>
                <span className="text-neutral-500 text-[11px]">— {c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (lower === "neofetch" || lower === "fastfetch") {
      outputNode = (
        <div className="flex flex-col sm:flex-row gap-4 font-mono text-xs text-neutral-300 pt-2">
          {/* ASCII Logo */}
          <pre className="text-blue-400 font-bold text-[10px] leading-none select-none">
{`   _____          _  _         ____   _____ 
  |  __ \\        | |(_)       / __ \\ / ____|
  | |__) |__ _ __| | _  __ _ | |  | | (___  
  |  _  // _\` / _\` || |/ _\` || |  | |\\___ \\ 
  | | \\ \\ (_| \\__,_|| | (_| || |__| |____) |
  |_|  \\_\\__,_|___/_/ |\\__,_| \\____/|_____/ 
                  |__/                      `}
          </pre>
          <div className="space-y-0.5 text-xs">
            <p className="text-white font-bold">radja@radjaos-cachyos</p>
            <p className="text-neutral-500">----------------------</p>
            <p><span className="text-blue-400 font-semibold">OS:</span> RadjaOS (Astro 5 + React 19 + Linux)</p>
            <p><span className="text-blue-400 font-semibold">Host:</span> SIDIGS Workstation</p>
            <p><span className="text-blue-400 font-semibold">Role:</span> Junior Full Stack Developer</p>
            <p><span className="text-blue-400 font-semibold">Kernel:</span> 6.13.0-cachyos-zen</p>
            <p><span className="text-blue-400 font-semibold">Uptime:</span> 20 Years in this world</p>
            <p><span className="text-blue-400 font-semibold">Shell:</span> MommyScript / fish</p>
            <p><span className="text-blue-400 font-semibold">WM:</span> Hyprland 0.55+ (Caelestia / macOS)</p>
            <p><span className="text-blue-400 font-semibold">Memory:</span> 3840MiB / 4096MiB (99% node_modules)</p>
          </div>
        </div>
      );
    } else if (lower === "projects") {
      onOpenProjects();
      outputNode = <span className="text-emerald-400">Launching Projects.app...</span>;
    } else if (lower.startsWith("sudo")) {
      outputNode = (
        <span className="text-amber-400">
          [sudo] password for radja: **********<br />
          radja is not in the sudoers file. This incident will be reported to Mommy.
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
          command not found: {trimmed}. Type <span className="underline font-bold">help</span> to view available commands.
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
      className="h-full flex flex-col font-mono text-xs bg-neutral-950/80 -m-5 p-4 rounded-b-xl overflow-hidden cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Output Log */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            {h.command !== "welcome" && (
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="text-emerald-400 font-bold">radja@radjaos</span>
                <span className="text-blue-400">:~#</span>
                <span className="text-white">{h.command}</span>
              </div>
            )}
            <div className="pl-0">{h.output}</div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Autocomplete / Command Suggestion Pills */}
      <div className="pt-2 pb-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 select-none">
        <span className="text-[10px] text-neutral-500 mr-1">Suggestions:</span>
        {availableCommands.map((cmd) => (
          <button
            key={cmd.name}
            type="button"
            onClick={() => executeCommand(cmd.name)}
            className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-blue-600/40 hover:text-blue-300 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
            title={cmd.desc}
          >
            {cmd.name}
          </button>
        ))}
      </div>

      {/* Input Prompt Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1 border-t border-white/5">
        <span className="text-emerald-400 font-bold">radja@radjaos</span>
        <span className="text-blue-400">:~#</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type a command..."
          autoFocus
          className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-neutral-600 font-mono text-xs"
        />
      </form>
    </div>
  );
};
