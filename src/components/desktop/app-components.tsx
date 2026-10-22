import React from "react";
import type { AppId } from "../../lib/os-state";
import { APPS } from "../../data/app-manifest";
import type { AppRuntime } from "./app-types";

type Loader = () => Promise<{ default: React.ComponentType<AppRuntime> }>;

const loadAbout: Loader = async () => {
  const { AboutApp } = await import("./apps/AboutApp");
  const Wrapped: React.FC<AppRuntime> = (p) => (
    <AboutApp
      locale={p.locale}
      onOpenProjects={() => p.openApp("projects")}
      onOpenTerminal={() => p.openApp("terminal")}
    />
  );
  return { default: Wrapped };
};

const loadProjects: Loader = async () => {
  const { ProjectsApp } = await import("./apps/ProjectsApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <ProjectsApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadSkills: Loader = async () => {
  const { SkillsApp } = await import("./apps/SkillsApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <SkillsApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadExperience: Loader = async () => {
  const { ExperienceApp } = await import("./apps/ExperienceApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <ExperienceApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadTerminal: Loader = async () => {
  const { TerminalApp } = await import("./apps/TerminalApp");
  const Wrapped: React.FC<AppRuntime> = (p) => (
    <TerminalApp
      locale={p.locale}
      onOpenProjects={() => p.openApp("projects")}
      onTriggerBSOD={p.onTriggerBSOD}
      onOpenTools={() => p.openApp("json")}
    />
  );
  return { default: Wrapped };
};

const loadSettings: Loader = async () => {
  const { SettingsApp } = await import("./apps/SettingsApp");
  const Wrapped: React.FC<AppRuntime> = (p) => (
    <SettingsApp
      locale={p.locale}
      setLocale={p.setLocale}
      isMuted={p.isMuted}
      toggleMute={p.toggleMute}
      potatoMode={p.potatoMode}
      togglePotatoMode={p.togglePotatoMode}
      onSimulateExpiry={p.onSimulateExpiry}
    />
  );
  return { default: Wrapped };
};

const loadTrash: Loader = async () => {
  const { TrashApp } = await import("./apps/TrashApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <TrashApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadStudio: Loader = async () => {
  const { ImageStudioApp } = await import("./apps/ImageStudioApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <ImageStudioApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadToolsHub: Loader = async () => {
  const { ToolsApp } = await import("./apps/ToolsApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <ToolsApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadPomodoro: Loader = async () => {
  const { PomodoroApp } = await import("./apps/PomodoroApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <PomodoroApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadColor: Loader = async () => {
  const { ColorStudioApp } = await import("./apps/ColorStudioApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <ColorStudioApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadText: Loader = async () => {
  const { TextWorkbenchApp } = await import("./apps/TextWorkbenchApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <TextWorkbenchApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadConverter: Loader = async () => {
  const { ConverterApp } = await import("./apps/ConverterApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <ConverterApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadGit: Loader = async () => {
  const { GitCheatsheetApp } = await import("./apps/GitCheatsheetApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <GitCheatsheetApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadFormatter: Loader = async () => {
  const { FormatterApp } = await import("./apps/FormatterApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <FormatterApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadMedia: Loader = async () => {
  const { MediaPlayerApp } = await import("./apps/MediaPlayerApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <MediaPlayerApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadDocuments: Loader = async () => {
  const { DocumentViewerApp } = await import("./apps/DocumentViewerApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <DocumentViewerApp locale={p.locale} />;
  return { default: Wrapped };
};

const loadCode: Loader = async () => {
  const { CodeStudioApp } = await import("./apps/CodeStudioApp");
  const Wrapped: React.FC<AppRuntime> = (p) => <CodeStudioApp locale={p.locale} />;
  return { default: Wrapped };
};

type UtilityId = "json" | "base64" | "hash" | "jwt" | "uuid" | "epoch" | "qr";

const utilityLoader = (id: UtilityId): Loader => async () => {
  const { UtilityApp } = await import("./apps/UtilityApp");
  const Wrapped: React.FC<AppRuntime> = (p) => (
    <UtilityApp id={id} locale={p.locale} />
  );
  return { default: Wrapped };
};

const LOADERS: Record<AppId, Loader> = {
  about: loadAbout,
  projects: loadProjects,
  skills: loadSkills,
  experience: loadExperience,
  terminal: loadTerminal,
  settings: loadSettings,
  trash: loadTrash,
  studio: loadStudio,
  tools: loadToolsHub,
  pomodoro: loadPomodoro,
  color: loadColor,
  text: loadText,
  converter: loadConverter,
  git: loadGit,
  formatter: loadFormatter,
  media: loadMedia,
  documents: loadDocuments,
  code: loadCode,
  json: utilityLoader("json"),
  base64: utilityLoader("base64"),
  hash: utilityLoader("hash"),
  jwt: utilityLoader("jwt"),
  uuid: utilityLoader("uuid"),
  epoch: utilityLoader("epoch"),
  qr: utilityLoader("qr"),
};

export const LAZY_APPS = Object.fromEntries(
  APPS.map((app) => [app.id, React.lazy(LOADERS[app.id])])
) as Record<AppId, React.LazyExoticComponent<React.ComponentType<AppRuntime>>>;
