import React, { useState } from "react";
import { type Locale, t } from "../../../lib/i18n";
import { dummyProjects, type ProjectItem } from "../../../data/dummy-data";
import { ExternalLink, Images, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProjectsAppProps {
  locale: Locale;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FigmaIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 38 57" fill="none">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
  </svg>
);

export const ProjectsApp: React.FC<ProjectsAppProps> = ({ locale }) => {
  // Gallery Lightbox state
  const [activeGalleryProject, setActiveGalleryProject] = useState<ProjectItem | null>(null);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);

  const openGallery = (proj: ProjectItem, index = 0) => {
    setActiveGalleryProject(proj);
    setActiveScreenshotIndex(index);
  };

  const closeGallery = () => {
    setActiveGalleryProject(null);
    setActiveScreenshotIndex(0);
  };

  const nextScreenshot = () => {
    if (!activeGalleryProject) return;
    setActiveScreenshotIndex((prev) =>
      prev < activeGalleryProject.screenshots.length - 1 ? prev + 1 : 0
    );
  };

  const prevScreenshot = () => {
    if (!activeGalleryProject) return;
    setActiveScreenshotIndex((prev) =>
      prev > 0 ? prev - 1 : activeGalleryProject.screenshots.length - 1
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t("projects.title", locale)}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {dummyProjects.length} Projects
          </span>
        </div>
        <p className="text-xs text-neutral-400">{t("projects.desc", locale)}</p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dummyProjects.map((proj) => (
          <div
            key={proj.id}
            className="group rounded-xl border border-white/10 bg-neutral-950/60 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all hover:shadow-xl hover:shadow-black/60"
          >
            <div>
              {/* Preview Image with Gallery Trigger */}
              <div
                onClick={() => openGallery(proj, 0)}
                className="relative aspect-video w-full overflow-hidden bg-neutral-900 border-b border-white/5 cursor-pointer"
                title={t("projects.viewScreenshots", locale)}
              >
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur text-neutral-300 border border-white/10">
                  {proj.category}
                </span>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/75 backdrop-blur border border-white/10 text-[10px] text-neutral-200 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 hover:bg-blue-600/80 transition-all"
                >
                  <Images className="w-3 h-3 text-blue-400" />
                  <span>{proj.screenshots.length} {t("projects.gallery", locale)}</span>
                </button>
              </div>

              {/* Text Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/5 text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Single Button (Figma or GitHub Repo) */}
            <div className="p-4 pt-0">
              <a
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  proj.isFigma
                    ? "border-pink-500/30 bg-pink-950/20 hover:bg-pink-900/30 text-pink-300 hover:text-white hover:border-pink-500/50 shadow-sm"
                    : "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                {proj.isFigma ? (
                  <FigmaIcon className="w-3.5 h-3.5" />
                ) : (
                  <GithubIcon className="w-3.5 h-3.5" />
                )}
                <span>
                  {proj.isFigma
                    ? t("projects.figma", locale)
                    : t("projects.repo", locale)}
                </span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Screenshot Lightbox Modal */}
      {activeGalleryProject && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeGallery}
        >
          <div
            className="relative max-w-3xl w-full bg-neutral-900/95 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-950/80">
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  {activeGalleryProject.title}
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  ({activeScreenshotIndex + 1}/{activeGalleryProject.screenshots.length})
                </span>
              </div>
              <button
                onClick={closeGallery}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={t("projects.closeGallery", locale)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Active Screenshot */}
            <div className="relative flex-1 bg-black/60 flex items-center justify-center p-2 min-h-[260px] sm:min-h-[380px] overflow-hidden">
              <img
                src={activeGalleryProject.screenshots[activeScreenshotIndex]}
                alt={`${activeGalleryProject.title} screenshot ${activeScreenshotIndex + 1}`}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
              />

              {/* Prev / Next Arrows */}
              {activeGalleryProject.screenshots.length > 1 && (
                <>
                  <button
                    onClick={prevScreenshot}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors cursor-pointer"
                    title="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextScreenshot}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors cursor-pointer"
                    title="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip & Direct Link */}
            <div className="p-3 bg-neutral-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {activeGalleryProject.screenshots.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScreenshotIndex(idx)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeScreenshotIndex === idx
                        ? "border-blue-500 ring-2 ring-blue-500/40"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={s}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* External Repo / Figma Link */}
              <a
                href={activeGalleryProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <span>{activeGalleryProject.isFigma ? t("projects.figma", locale) : t("projects.repo", locale)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
