import React, { useState } from "react";
import { type Locale, t } from "../../../lib/i18n";
import { trashItems } from "../../../data/dummy-data";
import { Trash2, FileCode, Folder, AlertTriangle } from "lucide-react";
import { playErrorBeep } from "../../../lib/sound";

interface TrashAppProps {
  locale: Locale;
}

export const TrashApp: React.FC<TrashAppProps> = ({ locale }) => {
  const [items] = useState(trashItems);
  const [warning, setWarning] = useState<string | null>(null);

  const handleEmpty = () => {
    playErrorBeep();
    setWarning(t("trash.emptyWarning", locale));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>{t("trash.title", locale)}</span>
          </h2>
          <p className="text-xs text-neutral-400">{t("trash.subtitle", locale)}</p>
        </div>

        <button
          onClick={handleEmpty}
          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          {t("trash.emptyBtn", locale)}
        </button>
      </div>

      {warning && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {/* Trash Item List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 hover:border-white/15 transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-neutral-200">
                {item.type.includes("Directory") ? (
                  <Folder className="w-4 h-4 text-amber-400" />
                ) : (
                  <FileCode className="w-4 h-4 text-blue-400" />
                )}
                <span className="font-semibold">{item.name}</span>
              </div>
              <span className="font-mono text-[11px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                {item.size}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 pl-6 italic">
              "{item.joke}"
            </p>
            <div className="text-[10px] text-neutral-600 pl-6">
              Deleted: {item.date} • Type: {item.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
