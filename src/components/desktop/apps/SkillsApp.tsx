import React from "react";
import { type Locale, t } from "../../../lib/i18n";
import { dummySkills } from "../../../data/dummy-data";
import { CheckCircle2, Cpu } from "lucide-react";

interface SkillsAppProps {
  locale: Locale;
}

export const SkillsApp: React.FC<SkillsAppProps> = ({ locale }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {t("skills.title", locale)}
        </h2>
        <p className="text-xs text-neutral-400">
          Technologies, frameworks, and tools I use for daily web development.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dummySkills.map((group) => (
          <div
            key={group.name}
            className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
                {group.name}
              </h3>
            </div>

            <div className="space-y-2.5">
              {group.items.map((item) => (
                <div key={item.name} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.name}</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 pl-5">
                    {item.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
