import type { TranslationKey } from "../lib/i18n";
import type { AppId } from "../lib/os-state";

export type AppCategory = "system" | "productivity" | "dev" | "creative";

export interface AppManifest {
  id: AppId;
  nameKey: TranslationKey;
  icon: string;
  category: AppCategory;
  size: { w: number; h: number };
  /** Render an icon on the desktop surface. */
  desktop: boolean;
  /** Pin to the taskbar. Keep this list short or the dock overflows. */
  pinTaskbar: boolean;
  badge?: string;
  keywords: string[];
}

export const APP_CATEGORIES: AppCategory[] = [
  "system",
  "productivity",
  "dev",
  "creative",
];

export const CATEGORY_KEY: Record<AppCategory, TranslationKey> = {
  system: "cat.system",
  productivity: "cat.productivity",
  dev: "cat.dev",
  creative: "cat.creative",
};

export const APPS: AppManifest[] = [
  {
    id: "about",
    nameKey: "app.about",
    icon: "/image/win11/thispc.png",
    category: "system",
    size: { w: 720, h: 480 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["profile", "about", "me", "bio", "contact"],
  },
  {
    id: "projects",
    nameKey: "app.projects",
    icon: "/image/win11/explorer.png",
    category: "system",
    size: { w: 820, h: 550 },
    desktop: true,
    pinTaskbar: true,
    badge: "3",
    keywords: ["portfolio", "work", "case", "showcase"],
  },
  {
    id: "skills",
    nameKey: "app.skills",
    icon: "/image/win11/vscode.png",
    category: "system",
    size: { w: 750, h: 490 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["stack", "tech", "abilities", "proficiency"],
  },
  {
    id: "experience",
    nameKey: "app.experience",
    icon: "/image/win11/experience.png",
    category: "system",
    size: { w: 700, h: 500 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["career", "history", "timeline", "work"],
  },
  {
    id: "terminal",
    nameKey: "app.terminal",
    icon: "/image/win11/terminal.png",
    category: "dev",
    size: { w: 680, h: 520 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["shell", "command", "cli", "rsh"],
  },
  {
    id: "settings",
    nameKey: "app.settings",
    icon: "/image/win11/settings.png",
    category: "system",
    size: { w: 620, h: 520 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["preferences", "wallpaper", "theme", "language", "sound"],
  },
  {
    id: "trash",
    nameKey: "app.trash",
    icon: "/image/win11/bin0.png",
    category: "system",
    size: { w: 600, h: 420 },
    desktop: true,
    pinTaskbar: true,
    badge: "999GB",
    keywords: ["recycle", "bin", "cleanup", "node_modules"],
  },
  {
    id: "studio",
    nameKey: "app.studio",
    icon: "/image/win11/studio.png",
    category: "creative",
    size: { w: 960, h: 620 },
    desktop: true,
    pinTaskbar: true,
    badge: "AI",
    keywords: ["image", "cutout", "background", "photo", "studio"],
  },
  {
    id: "pomodoro",
    nameKey: "app.pomodoro",
    icon: "/image/win11/pomodoro.png",
    category: "productivity",
    size: { w: 760, h: 560 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["timer", "focus", "break", "study", "productivity"],
  },
  {
    id: "code",
    nameKey: "app.code",
    icon: "/image/win11/code.png",
    category: "dev",
    size: { w: 1120, h: 700 },
    desktop: true,
    pinTaskbar: true,
    badge: "NEW",
    keywords: ["editor", "monaco", "ide", "typescript", "lint", "files"],
  },
  {
    id: "color",
    nameKey: "app.color",
    icon: "/image/win11/color.png",
    category: "creative",
    size: { w: 880, h: 620 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["palette", "gradient", "contrast", "hex", "oklch"],
  },
  {
    id: "text",
    nameKey: "app.text",
    icon: "/image/win11/text.png",
    category: "productivity",
    size: { w: 920, h: 620 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["markdown", "html", "transform", "regex", "format"],
  },
  {
    id: "converter",
    nameKey: "app.converter",
    icon: "/image/win11/converter.png",
    category: "dev",
    size: { w: 920, h: 640 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["json", "yaml", "toml", "typescript", "zod", "csv"],
  },
  {
    id: "git",
    nameKey: "app.git",
    icon: "/image/win11/git.png",
    category: "dev",
    size: { w: 880, h: 620 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["git", "branch", "rebase", "commit", "cheatsheet"],
  },
  {
    id: "formatter",
    nameKey: "app.formatter",
    icon: "/image/win11/formatter.png",
    category: "dev",
    size: { w: 940, h: 640 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["prettier", "beautify", "format", "style", "lint"],
  },
  {
    id: "media",
    nameKey: "app.media",
    icon: "/image/win11/media.png",
    category: "productivity",
    size: { w: 880, h: 600 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["video", "audio", "player", "subtitle", "playlist"],
  },
  {
    id: "documents",
    nameKey: "app.documents",
    icon: "/image/win11/documents.png",
    category: "productivity",
    size: { w: 960, h: 650 },
    desktop: true,
    pinTaskbar: true,
    keywords: ["pdf", "csv", "xlsx", "docx", "viewer", "document"],
  },
  {
    id: "json",
    nameKey: "app.json",
    icon: "/image/win11/json.png",
    category: "dev",
    size: { w: 780, h: 580 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["json", "format", "minify", "validate", "tree"],
  },
  {
    id: "base64",
    nameKey: "app.base64",
    icon: "/image/win11/base64.png",
    category: "dev",
    size: { w: 780, h: 580 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["base64", "encode", "decode", "url", "image"],
  },
  {
    id: "hash",
    nameKey: "app.hash",
    icon: "/image/win11/hash.png",
    category: "dev",
    size: { w: 780, h: 560 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["sha", "md5", "hash", "checksum", "crypto"],
  },
  {
    id: "jwt",
    nameKey: "app.jwt",
    icon: "/image/win11/jwt.png",
    category: "dev",
    size: { w: 820, h: 620 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["jwt", "token", "claims", "decode", "auth"],
  },
  {
    id: "uuid",
    nameKey: "app.uuid",
    icon: "/image/win11/uuid.png",
    category: "dev",
    size: { w: 740, h: 540 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["uuid", "guid", "id", "generate", "random"],
  },
  {
    id: "epoch",
    nameKey: "app.epoch",
    icon: "/image/win11/epoch.png",
    category: "dev",
    size: { w: 780, h: 560 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["epoch", "timestamp", "unix", "date", "time"],
  },
  {
    id: "qr",
    nameKey: "app.qr",
    icon: "/image/win11/qr.png",
    category: "dev",
    size: { w: 760, h: 580 },
    desktop: true,
    pinTaskbar: false,
    keywords: ["qr", "code", "scan", "link", "vcard"],
  },
  {
    id: "tools",
    nameKey: "app.tools",
    icon: "/image/win11/taskmanager.png",
    category: "dev",
    size: { w: 880, h: 580 },
    desktop: false,
    pinTaskbar: false,
    keywords: ["utilities", "all tools", "toolbox"],
  },
];

export const APP_MAP: Record<AppId, AppManifest> = Object.fromEntries(
  APPS.map((app) => [app.id, app])
) as Record<AppId, AppManifest>;

export const DESKTOP_APPS = APPS.filter((app) => app.desktop);
export const TASKBAR_APPS = APPS.filter((app) => app.pinTaskbar);
