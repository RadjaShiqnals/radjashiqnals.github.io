import React, { useState, useRef, useEffect } from "react";
import { Minus, Square, Copy, X } from "lucide-react";
import { playWindowClose } from "../../lib/sound";

interface WindowFrameProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  iconSrc?: string;
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
  iconSrc,
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
  const [showSnapPreview, setShowSnapPreview] = useState(false);

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
      const y = Math.max(20, Math.floor((screenH - initialHeight - 48) / 2.3) + (id === "about" ? 0 : 20));
      posRef.current = { x, y };
      setPos({ x, y });
    }
  }, [id, initialWidth, initialHeight, isMobile]);

  // Global pointer listeners during drag (rAF throttled & zero React re-renders during movement)
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const newX = Math.max(10, Math.min(window.innerWidth - 80, e.clientX - dragStart.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragStart.current.y));
      posRef.current = { x: newX, y: newY };

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          if (potatoMode) {
            if (ghostRef.current) {
              ghostRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
            }
          } else {
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

  // Mobile Sheet View
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 bottom-12 bg-[#1e1e1e] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
        style={{ zIndex: zIndex || 40 }}
        onClick={onFocus}
      >
        <div className="h-10 bg-[#252525] border-b border-white/10 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-xs text-white truncate max-w-[65vw]">
            {iconSrc ? (
              <img src={iconSrc} alt={title} className="w-4 h-4 object-contain shrink-0" />
            ) : (
              icon
            )}
            <span className="truncate">{title}</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playWindowClose();
                onMinimize();
              }}
              className="w-10 h-10 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playWindowClose();
                onClose();
              }}
              className="w-10 h-10 hover:bg-[#c42b1c] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-20 text-neutral-200">
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

  // RadjaOS Mica Surface Styling
  const getWindowClasses = () => {
    if (potatoMode) {
      if (isFocused) {
        return "bg-[#1f1f1f] border-white/20 shadow-2xl shadow-black";
      }
      return "bg-[#181818] border-white/10 shadow-lg shadow-black/80 opacity-95";
    }

    if (isDragging) {
      return "bg-[#202020]/90 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/90";
    }
    if (isFocused) {
      return "bg-[#202020]/88 backdrop-blur-2xl border-white/15 shadow-2xl shadow-black/80 ring-1 ring-white/10";
    }
    return "bg-[#1a1a1a]/85 backdrop-blur-xl border-white/10 shadow-lg shadow-black/60 opacity-95 hover:opacity-100 transition-opacity duration-150";
  };

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        zIndex,
        left: 0,
        top: 0,
        width: "100vw",
        height: "calc(100vh - 48px)",
        transform: "none",
        transition: "all 0.16s cubic-bezier(0.1, 0.9, 0.2, 1)",
      }
    : {
        zIndex,
        left: 0,
        top: 0,
        width: `${initialWidth}px`,
        height: `${initialHeight}px`,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        willChange: isDragging ? "transform" : "auto",
        transition: isDragging ? "none" : "width 0.16s ease-out, height 0.16s ease-out",
      };

  return (
    <>
      {/* Potato Mode Outline */}
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
          className="fixed border-2 border-dashed border-blue-400 bg-blue-500/10 rounded-[8px] pointer-events-none shadow-2xl"
        >
          <div className="h-9 bg-blue-500/20 border-b border-blue-400/30 px-3 flex items-center gap-2 text-xs font-mono text-blue-300">
            <span>Moving: {title}</span>
          </div>
        </div>
      )}

      {/* Main RadjaOS Frame */}
      <div
        ref={windowRef}
        onPointerDown={onFocus}
        onMouseEnter={() => {
          if (!isDragging) {
            onHoverFocus();
          }
        }}
        style={windowStyle}
        className={`fixed flex flex-col ${
          isMaximized ? "rounded-none border-x-0 border-t-0" : "rounded-[8px] border"
        } overflow-hidden select-none ${getWindowClasses()}`}
      >
        {/* RadjaOS Titlebar */}
        <div
          onPointerDown={handleTitleBarPointerDown}
          onDoubleClick={onToggleMaximize}
          className={`h-9 shrink-0 flex items-center justify-between select-none ${
            isFocused ? "bg-white/[0.03]" : "bg-transparent"
          } ${isMaximized ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-default"}`}
        >
          {/* Left: App Icon & Window Title */}
          <div className="flex items-center gap-2 pl-3 pointer-events-none">
            {iconSrc ? (
              <img src={iconSrc} alt={title} className="w-4 h-4 object-contain" />
            ) : (
              icon
            )}
            <span className={`text-xs font-normal tracking-wide transition-colors ${
              isFocused ? "text-neutral-200" : "text-neutral-400"
            }`}>
              {title}
            </span>
          </div>

          {/* Draggable center area */}
          <div className="flex-1 h-full"></div>

          {/* Right: RadjaOS Caption Buttons */}
          <div className="flex items-center h-full">
            {/* Minimize */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="w-11 h-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Maximize / Restore with Snap Layout Tooltip */}
            <div
              className="relative h-full"
              onMouseEnter={() => setShowSnapPreview(true)}
              onMouseLeave={() => setShowSnapPreview(false)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMaximize();
                }}
                className="w-11 h-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? (
                  <Copy className="w-3 h-3 rotate-180" />
                ) : (
                  <Square className="w-3 h-3" />
                )}
              </button>

              {/* RadjaOS Snap Layouts Preview on hover */}
              {showSnapPreview && (
                <div className="absolute top-10 right-0 w-48 p-2 rounded-lg bg-[#252525]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <p className="text-[10px] text-neutral-400 font-medium mb-1.5 px-1">Snap layouts</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* 50-50 Split */}
                    <div className="p-1 rounded bg-white/5 border border-white/10 grid grid-cols-2 gap-1 h-10">
                      <div className="bg-blue-500/40 border border-blue-400/50 rounded-sm"></div>
                      <div className="bg-white/10 rounded-sm"></div>
                    </div>
                    {/* 2/3 - 1/3 Split */}
                    <div className="p-1 rounded bg-white/5 border border-white/10 grid grid-cols-3 gap-1 h-10">
                      <div className="col-span-2 bg-blue-500/40 border border-blue-400/50 rounded-sm"></div>
                      <div className="bg-white/10 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playWindowClose();
                onClose();
              }}
              className="w-11 h-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#c42b1c] active:bg-[#b22617] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window Body Canvas */}
        <div className="flex-1 overflow-y-auto p-5 text-neutral-200 selection:bg-blue-600/50 bg-[#1e1e1e]/60">
          {children}
        </div>
      </div>
    </>
  );
};
