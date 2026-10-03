import React, { useEffect, useRef } from "react";
import {
  RotateCw,
  Terminal,
  Settings,
  LayoutGrid,
  ArrowUpDown,
  FolderPlus,
  Monitor,
  Info,
} from "lucide-react";
import { type AppId } from "../../lib/os-state";
import { playWindowOpen } from "../../lib/sound";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  onRefresh: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onOpenApp,
  onRefresh,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or escape key
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("pointerdown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Adjust coordinates so menu doesn't overflow screen bounds
  const adjustedX = Math.min(x, window.innerWidth - 240);
  const adjustedY = Math.min(y, window.innerHeight - 340);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-56 rounded-xl acrylic-surface p-1.5 shadow-2xl border border-white/10 text-xs text-neutral-200 select-none animate-win-zoom space-y-0.5"
    >
      {/* View Options */}
      <button
        onClick={onClose}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-neutral-400" />
        <span>View</span>
      </button>

      {/* Sort by */}
      <button
        onClick={onClose}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
        <span>Sort by</span>
      </button>

      {/* Refresh */}
      <button
        onClick={() => {
          onRefresh();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
        <span>Refresh</span>
      </button>

      <div className="h-px bg-white/10 my-1" />

      {/* New Folder */}
      <button
        onClick={() => {
          onOpenApp("projects");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <FolderPlus className="w-3.5 h-3.5 text-neutral-400" />
        <span>New folder</span>
      </button>

      <div className="h-px bg-white/10 my-1" />

      {/* Display settings */}
      <button
        onClick={() => {
          onOpenApp("settings");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <Monitor className="w-3.5 h-3.5 text-neutral-400" />
        <span>Display settings</span>
      </button>

      {/* Personalize (Wallpaper & Theme) */}
      <button
        onClick={() => {
          playWindowOpen();
          onOpenApp("settings");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <Settings className="w-3.5 h-3.5 text-neutral-400" />
        <span>Personalize</span>
      </button>

      {/* Open in Terminal */}
      <button
        onClick={() => {
          playWindowOpen();
          onOpenApp("terminal");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
        <span>Open in Terminal</span>
      </button>

      <div className="h-px bg-white/10 my-1" />

      {/* About RadjaOS */}
      <button
        onClick={() => {
          playWindowOpen();
          onOpenApp("about");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-blue-300 hover:text-white transition-colors cursor-pointer font-medium"
      >
        <Info className="w-3.5 h-3.5 text-blue-400" />
        <span>About RadjaOS 11</span>
      </button>
    </div>
  );
};
