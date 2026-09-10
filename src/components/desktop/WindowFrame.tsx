import React, { useState, useRef, useEffect } from "react";
import { X, Minus, Square } from "lucide-react";
import { playWindowClose } from "../../lib/sound";

interface WindowFrameProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  isMobile: boolean;
  potatoMode: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onHoverFocus: () => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  isFocused,
  zIndex,
  initialX = 120,
  initialY = 70,
  initialWidth = 720,
  initialHeight = 480,
  isMobile,
  potatoMode,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onHoverFocus,
  children,
}) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: initialX, y: initialY });
  const dragStart = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // Center window on initial open if screen allows
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const x = Math.max(20, Math.floor((screenW - initialWidth) / 2) + (id === "about" ? 0 : 20));
      const y = Math.max(50, Math.floor((screenH - initialHeight) / 2.5) + (id === "about" ? 0 : 20));
      posRef.current = { x, y };
      setPos({ x, y });
    }
  }, [id, initialWidth, initialHeight, isMobile]);

  // Global pointer listeners during drag (rAF throttled & zero React re-renders during movement)
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const newX = Math.max(10, Math.min(window.innerWidth - 80, e.clientX - dragStart.current.x));
      const newY = Math.max(34, Math.min(window.innerHeight - 60, e.clientY - dragStart.current.y));
      posRef.current = { x: newX, y: newY };

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          if (potatoMode) {
            // In Potato Mode: only move the lightweight ghost outline
            if (ghostRef.current) {
              ghostRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
            }
          } else {
            // In Normal Mode: direct DOM transform without triggering React re-renders
            if (windowRef.current) {
              windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
            }
          }
          rafId.current = null;
        });
      }
    };

    const handlePointerUp = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      setIsDragging(false);
      setGhostPos(null);
      setPos(posRef.current);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [isDragging, potatoMode]);

  if (!isOpen || isMinimized) return null;

  // Mobile Sheet View (Native App Drawer style)
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 top-8 z-50 bg-neutral-950 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
        onClick={onFocus}
      >
        <div className="h-12 bg-neutral-900 border-b border-white/10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-sm text-white">
            {icon}
            <span>{title}</span>
          </div>
          <button
            onClick={() => {
              playWindowClose();
              onClose();
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-24 text-neutral-200">
          {children}
        </div>
      </div>
    );
  }

  // Pointer Down on Titlebar to start dragging
  const handleTitleBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    posRef.current = { x: pos.x, y: pos.y };

    if (potatoMode) {
      setGhostPos({ x: pos.x, y: pos.y });
    }

    setIsDragging(true);
    onFocus();
  };

  // CachyOS / Hyprland Window Style Architecture
  const getWindowClasses = () => {
    if (potatoMode) {
      // 100% Solid Opaque (Zero transparency bleed, zero GPU blur)
      if (isFocused) {
        return "bg-[#07090e] border-blue-500/50 shadow-2xl shadow-black ring-1 ring-blue-500/25";
      }
      return "bg-[#0f131c] border-white/10 shadow-lg shadow-black/80 opacity-95 hover:border-white/30 hover:opacity-100 transition-all duration-150";
    }

    // Normal Mode:
    if (isDragging) {
      return "bg-[#07090e] border-blue-500/50 shadow-blue-500/20";
    }
    if (isFocused) {
      return "bg-[#07090e]/98 backdrop-blur-3xl border-blue-500/40 shadow-2xl shadow-black ring-1 ring-blue-500/20";
    }
    return "bg-[#0e121b]/92 backdrop-blur-xl border-white/10 shadow-lg shadow-black/60 opacity-90 hover:opacity-100 hover:border-white/25 transition-all duration-150";
  };

  const getTitlebarClasses = () => {
    if (isFocused) {
      return potatoMode || isDragging
        ? "bg-[#05070a] border-white/15"
        : "bg-neutral-950/90 border-white/15";
    }
    return "bg-neutral-950/60 border-white/5";
  };

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        zIndex,
        left: 0,
        top: 32,
        width: "100vw",
        height: "calc(100vh - 32px)",
        transform: "none",
        transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    : {
        zIndex,
        left: 0,
        top: 0,
        width: `${initialWidth}px`,
        height: `${initialHeight}px`,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        willChange: isDragging ? "transform" : "auto",
        transition: isDragging ? "none" : "width 0.18s ease-out, height 0.18s ease-out",
      };

  return (
    <>
      {/* Potato Mode: Lightweight Wireframe Ghost Outline during Drag */}
      {potatoMode && isDragging && ghostPos && (
        <div
          ref={ghostRef}
          style={{
            zIndex: 9999,
            left: 0,
            top: 0,
            width: `${initialWidth}px`,
            height: `${initialHeight}px`,
            transform: `translate3d(${ghostPos.x}px, ${ghostPos.y}px, 0)`,
          }}
          className="fixed border-2 border-dashed border-blue-400 bg-blue-500/10 rounded-xl pointer-events-none shadow-2xl"
        >
          <div className="h-10 bg-blue-500/20 border-b border-blue-400/30 px-3 flex items-center gap-2 text-xs font-mono text-blue-300">
            {icon}
            <span>Moving: {title}</span>
          </div>
        </div>
      )}

      {/* Main Window Container with CachyOS / Hyprland focus architecture */}
      <div
        ref={windowRef}
        onPointerDown={onFocus}
        onMouseEnter={() => {
          if (!isDragging) {
            onHoverFocus();
          }
        }}
        style={windowStyle}
        className={`fixed flex flex-col rounded-xl overflow-hidden border select-none ${getWindowClasses()}`}
      >
        {/* Window Titlebar */}
        <div
          onPointerDown={handleTitleBarPointerDown}
          className={`h-10 border-b px-3 flex items-center justify-between select-none ${getTitlebarClasses()} ${
            isMaximized ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* Window Controls (Traffic lights) */}
          <div className={`flex items-center gap-2 transition-opacity ${isFocused ? "opacity-100" : "opacity-50"}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playWindowClose();
                onClose();
              }}
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 border border-rose-600 flex items-center justify-center group focus:outline-none cursor-pointer"
              title="Close"
            >
              <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 border border-amber-600 flex items-center justify-center group focus:outline-none cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize();
              }}
              className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 flex items-center justify-center group focus:outline-none cursor-pointer"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Window Title */}
          <div className={`flex items-center gap-2 text-xs font-semibold pointer-events-none transition-colors ${
            isFocused ? "text-white" : "text-neutral-400"
          }`}>
            {icon}
            <span>{title}</span>
          </div>

          {/* Spacer */}
          <div className="w-12"></div>
        </div>

        {/* Window Body */}
        <div className="flex-1 overflow-y-auto p-5 text-neutral-200 selection:bg-blue-600/40">
          {children}
        </div>
      </div>
    </>
  );
};
