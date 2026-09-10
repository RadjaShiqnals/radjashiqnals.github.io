import React from "react";
import { type AppId } from "../../lib/os-state";

interface DesktopIconProps {
  id?: AppId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  label,
  icon,
  badge,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center w-20 sm:w-24 p-2 rounded-xl text-center focus:outline-none hover:bg-white/10 active:bg-blue-600/30 transition-all duration-150 cursor-pointer select-none relative"
    >
      {/* Icon Container with subtle glow */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 border border-white/10 shadow-lg flex items-center justify-center text-neutral-200 group-hover:scale-105 group-hover:border-blue-500/50 group-hover:shadow-blue-500/20 group-hover:text-white transition-all duration-200">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full border border-neutral-900 shadow">
            {badge}
          </span>
        )}
      </div>

      {/* App Label */}
      <span className="mt-1.5 text-[11px] sm:text-xs font-medium text-neutral-200 group-hover:text-white tracking-wide line-clamp-1 drop-shadow-md px-1.5 py-0.5 rounded group-hover:bg-blue-600/60 transition-colors">
        {label}
      </span>
    </button>
  );
};
