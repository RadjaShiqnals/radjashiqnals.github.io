import React from "react";
import { type Locale, t } from "../../../lib/i18n";
import { dummyExperiences } from "../../../data/dummy-data";
import { Briefcase, Calendar } from "lucide-react";

interface ExperienceAppProps {
  locale: Locale;
}

export const ExperienceApp: React.FC<ExperienceAppProps> = ({ locale }) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {t("app.experience", locale)}
        </h2>
        <p className="text-xs text-neutral-400">
          Career history, leadership responsibilities, and engineering background.
        </p>
      </div>

      <div className="relative pl-6 border-l border-white/10 space-y-6 ml-2">
        {dummyExperiences.map((exp, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-neutral-900 ring-2 ring-blue-500/20" />

            <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm font-bold text-white">{exp.role}</h3>
                <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  <span>{exp.period}</span>
                </span>
              </div>

              <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{exp.company}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 font-normal">{exp.location}</span>
              </div>

              <ul className="space-y-1 pt-2 border-t border-white/5">
                {exp.summary.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-neutral-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
