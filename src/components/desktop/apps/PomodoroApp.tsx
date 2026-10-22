import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Locale } from "../../../lib/i18n";
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Volume2, VolumeX } from "lucide-react";

interface PomodoroAppProps {
  locale: Locale;
}

type Mode = "focus" | "shortBreak" | "longBreak";

const MODE_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  focus: "Focus Session",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

export const PomodoroApp: React.FC<PomodoroAppProps> = () => {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [completedCount, setCompletedCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("radjaos.pomodoro.completed") || "0");
    } catch {
      return 0;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio context policy fallback
    }
  }, [soundEnabled]);

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
    endTimeRef.current = null;
  };

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    endTimeRef.current = Date.now() + timeLeft * 1000;

    timerRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        playChime();

        if (mode === "focus") {
          setCompletedCount((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem("radjaos.pomodoro.completed", String(next));
            } catch {
              // Ignore storage errors
            }
            return next;
          });
        }
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, playChime, timeLeft]);

  const toggleRun = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
    endTimeRef.current = null;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-6 bg-[#181818]/95 text-white select-none overflow-y-auto">
      {/* Top Header & Mode Select */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Pomodoro Focus</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute chimes" : "Enable chimes"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{completedCount} done</span>
            </div>
          </div>
        </div>

        {/* Mode Pills */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs w-full justify-between">
          {(["focus", "shortBreak", "longBreak"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all cursor-pointer ${
                mode === m
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Circular Clock Display */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-white/10"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-cyan-400 transition-all duration-300 ease-linear"
              strokeWidth="4"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-mono font-bold tracking-tight text-white drop-shadow">
              {timeFormatted}
            </span>
            <span className="text-xs text-neutral-400 font-medium tracking-wide mt-1 uppercase">
              {MODE_LABELS[mode]}
            </span>
          </div>
        </div>

        {/* Focus Task Label */}
        <div className="mt-4 w-full max-w-xs">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Focus target (e.g. Refactor API routes)..."
            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-center text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleRun}
          className={`px-8 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
            isRunning
              ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
              : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
