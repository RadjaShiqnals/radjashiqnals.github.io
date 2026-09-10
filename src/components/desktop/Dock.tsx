import React from "react";
import { type AppId } from "../../lib/os-state";
import { type Locale, t } from "../../lib/i18n";
import { User, FolderGit2, Cpu, Briefcase, Terminal, Trash2, Settings } from "lucide-react";

interface DockProps {
  openWindows: Record<AppId, boolean>;
  activeWindowId: AppId | null;
  onOpenApp: (id: AppId) => void;
  locale: Locale;
}

export const Dock: React.FC<DockProps> = ({
  openWindows,
  activeWindowId,
  onOpenApp,
  locale,
}) => {
  const dockItems: { id: AppId; icon: React.ReactNode; labelKey: any }[] = [
    { id: "about", icon: <User className="w-5 h-5" />, labelKey: "app.about" },
    { id: "projects", icon: <FolderGit2 className="w-5 h-5 text-blue-400" />, labelKey: "app.projects" },
    { id: "skills", icon: <Cpu className="w-5 h-5 text-emerald-400" />, labelKey: "app.skills" },
    { id: "experience", icon: <Briefcase className="w-5 h-5 text-amber-400" />, labelKey: "app.experience" },
    { id: "terminal", icon: <Terminal className="w-5 h-5 text-cyan-400" />, labelKey: "app.terminal" },
    { id: "settings", icon: <Settings className="w-5 h-5 text-neutral-300" />, labelKey: "app.settings" },
    { id: "trash", icon: <Trash2 className="w-5 h-5 text-rose-400" />, labelKey: "app.trash" },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80">
        {dockItems.map((item) => {
          const isOpen = openWindows[item.id];
          const isActive = activeWindowId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onOpenApp(item.id)}
              className={`group relative p-2 sm:p-2.5 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:bg-white/10 focus:outline-none cursor-pointer flex flex-col items-center ${
                isActive ? "bg-white/10 shadow-inner" : ""
              }`}
              title={t(item.labelKey, locale)}
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-9 px-2 py-0.5 rounded-md bg-neutral-900/90 border border-white/10 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                {t(item.labelKey, locale)}
              </div>

              {/* Icon */}
              <div className="group-hover:scale-110 transition-transform">
                {item.icon}
              </div>

              {/* Open Indicator Dot */}
              <div
                className={`w-1 h-1 rounded-full mt-1 transition-all ${
                  isOpen
                    ? isActive
                      ? "bg-blue-400 w-2"
                      : "bg-neutral-400"
                    : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
