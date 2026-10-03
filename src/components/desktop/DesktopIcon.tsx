import React from "react";
import { type AppId } from "../../lib/os-state";

interface DesktopIconProps {
  id?: AppId;
  label: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  badge?: string;
  onClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  label,
  icon,
  iconSrc,
  badge,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-start w-full max-w-[84px] sm:w-[84px] py-1.5 px-1 mx-auto rounded-md text-center focus:outline-none hover:bg-white/10 border border-transparent hover:border-white/15 active:bg-blue-600/30 transition-colors duration-150 cursor-pointer select-none"
    >
      {/* Icon Image Container */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={label}
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-150"
            draggable={false}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-white/10 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}

        {badge && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-blue-500 text-white text-[9px] font-bold rounded-full border border-neutral-900 shadow">
            {badge}
          </span>
        )}
      </div>

      {/* App Label with RadjaOS drop shadow */}
      <span className="mt-1 text-[11px] font-normal text-white text-center line-clamp-2 px-1 leading-tight tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
        {label}
      </span>
    </button>
  );
};
