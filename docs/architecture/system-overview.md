# RadjaOS Web Desktop Environment: System Overview and Architecture

## 1. Executive Architectural Summary

RadjaOS is a standalone, proprietary web desktop operating system built as a high-fidelity single-page desktop environment. The architecture decouples the static delivery shell from an interactive, event-driven windowing kernel.

The platform utilizes a hybrid architecture:
1. **Host Shell**: Astro 5 provides server-side rendering, static content optimization, asset bundling, and baseline HTML document hydration.
2. **Desktop Kernel**: React 19 drives the interactive desktop runtime, window arbitration, transient surface rendering, and state management pipelines.
3. **Hardware Acceleration Engine**: CSS variables, native hardware transforms (`translate3d`), and `requestAnimationFrame` render loops guarantee fluid 60 frames-per-second interactions across variable client hardware.

```
+------------------------------------------------------------------------+
|                          Astro 5 Host Shell                            |
|  (Document Scaffolding, Static Meta, Fonts, Global CSS Entrypoints)     |
+------------------------------------------------------------------------+
                                   |
                          Hydration Boundary
                                   |
+------------------------------------------------------------------------+
|                   React 19 Desktop Kernel (DesktopEnv)                 |
|                                                                        |
|  +---------------------+  +--------------------+  +-----------------+  |
|  | Window Manager Core |  | State Synchronizer |  | Audio Synthesizer| |
|  +---------------------+  +--------------------+  +-----------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                    Subsystem State Stores                        |  |
|  |  * os-state.ts (Sessions, Windows, Eco Mode)                     |  |
|  |  * wallpaper-state.ts (Presets, Storage, Blur/Fit Pipelines)     |  |
|  |  * i18n.ts (Reactive Dictionaries: EN / ID / JA)                |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                         Layer Stack                              |  |
|  |  Layer 9999: System Modal / Lock Screen / BSOD Boundary           |  |
|  |  Layer 50:   Transient Flyouts, Menus & Context Flyouts          |  |
|  |  Layer 40:   Centered System Taskbar (48px Fixed Base)           |  |
|  |  Layer 20+:  Window Frame Stacking Context (Dynamic Z-Index)     |  |
|  |  Layer 10:   Desktop Shortcut Grid (Icon Placement Engine)       |  |
|  |  Layer -10:  Dynamic Wallpaper Canvas (Transforms & Filters)     |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

---

## 2. Host Shell and Hydration Model

The root page is rendered via Astro (`src/pages/index.astro`). It provides zero-overhead asset delivery, preloading fonts and stylesheet tokens before client hydration begins.

```astro
---
import DesktopEnv from "../components/desktop/DesktopEnv";
import "../styles/global.css";
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RadjaOS Web Desktop Environment</title>
  </head>
  <body>
    <DesktopEnv client:load />
  </body>
</html>
```

### Hydration Strategy
The root desktop component `DesktopEnv` is loaded using `client:load` to initialize immediately upon HTML parse. This avoids layout shift and enables the desktop canvas, audio listeners, session token evaluators, and window positions to mount instantaneously.

---

## 3. Core State Management Model

RadjaOS avoids heavy external state containers, using specialized native modules that interface with browser APIs, custom events, and local persistent stores.

```
+------------------------------------------------------------------------+
|                        State Store Topology                            |
+------------------------------------------------------------------------+
        |                                   |
        v                                   v
+-----------------------+       +-------------------------+
|      os-state.ts      |       |   wallpaper-state.ts    |
| - AppId Registry      |       | - WallpaperConfig       |
| - WindowState Schema  |       | - IndexedDB Raw Blobs   |
| - 7-Day Session TTL   |       | - CustomEvent Pub-Sub   |
| - Eco (Potato) Mode   |       | - CSS Matrix Transforms |
+-----------------------+       +-------------------------+
        |                                   |
        +-----------------+-----------------+
                          |
                          v
                +--------------------+
                |      i18n.ts       |
                | - Locale ('en'|'id'|'ja')
                | - Dictionaries     |
                | - Reactive t()     |
                +--------------------+
```

### 3.1. OS Kernel State (`src/lib/os-state.ts`)

The kernel module defines valid application identities, window configuration schemas, security session validation, and eco mode switches.

#### Application Identifiers
Every process inside RadjaOS must register a valid `AppId`:
```typescript
export type AppId =
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "terminal"
  | "trash"
  | "settings";
```

#### Window State Interface
```typescript
export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

#### Simulated Security Session Model
RadjaOS enforces a simulated security validation requiring authentication refreshes every 7 days (604,800,000 milliseconds):
```typescript
const SESSION_KEY = "radjaos_session_timestamp";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function checkSessionValid(): { valid: boolean; expired: boolean } {
  if (typeof window === "undefined") return { valid: false, expired: false };
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return { valid: false, expired: false };

  const timestamp = parseInt(stored, 10);
  if (isNaN(timestamp)) return { valid: false, expired: false };

  const age = Date.now() - timestamp;
  if (age >= SEVEN_DAYS_MS) {
    localStorage.removeItem(SESSION_KEY);
    return { valid: false, expired: true };
  }
  return { valid: true, expired: false };
}
```

#### Eco Mode (Potato Mode) Persistence
For lower-power clients or integrated graphics chips, an eco flag completely bypasses heavy GPU backdrop filters and switches dragging mechanics to ghost wireframes:
```typescript
const POTATO_KEY = "radjaos_potato_mode";

export function getPotatoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(POTATO_KEY) === "true";
}

export function setPotatoModeState(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(POTATO_KEY, enabled ? "true" : "false");
  }
}
```

### 3.2. Dynamic Wallpaper State (`src/lib/wallpaper-state.ts`)

Wallpaper configuration supports presets, external URLs, procedural mesh gradients, and user-supplied local raw image blobs stored directly inside IndexedDB (`src/lib/wallpaper-db.ts`).

#### Configuration Schema
```typescript
export interface WallpaperConfig {
  type: "preset" | "url" | "custom_raw" | "mesh";
  presetId: string;
  customUrl?: string;
  rawBlobId?: string;
  fit: "cover" | "contain" | "fill";
  opacity: number;
  blur: number;
  flipH: boolean;
  flipV: boolean;
  rotation: number;
}
```

#### Event-Driven Pub-Sub Architecture
Wallpaper mutations trigger cross-component DOM updates via standard window custom events:
```typescript
export const WALLPAPER_CHANGE_EVENT = "radjaos_wallpaper_change";

export function saveWallpaperConfig(config: WallpaperConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(
      new CustomEvent(WALLPAPER_CHANGE_EVENT, { detail: config })
    );
  } catch (err) {
    console.error("Failed to save wallpaper config:", err);
  }
}
```

### 3.3. Multilingual Dictionary Architecture (`src/lib/i18n.ts`)

RadjaOS ships with built-in internationalization supporting English (`en`), Indonesian (`id`), and Japanese (`ja`).

- **Locale Schema**: `type Locale = "en" | "id" | "ja"`
- **Storage Persistence**: Synchronized against `localStorage.getItem("radjaos_locale")`
- **Translation Lookup**: Fast dictionary indexing using strongly typed dot-notation string keys:
  ```typescript
  export function t(key: TranslationKey, locale: Locale = "en"): string {
    const dict = dictionaries[locale] || dictionaries.en;
    return dict[key] || dictionaries.en[key] || key;
  }
  ```

---

## 4. Layer Stack and Stacking Contexts

RadjaOS enforces a strict z-index stacking context hierarchy to prevent overlay conflicts, event leaks, and clipping glitches.

| Stacking Level | Z-Index Value | Layer Identifier | DOM Responsibilities |
| :--- | :--- | :--- | :--- |
| **Layer 0** | `-z-10` | Wallpaper Canvas | Procedural backgrounds, hardware image transforms, blur filters, desktop build watermark. |
| **Layer 1** | `z-10` | Desktop Grid | Clickable desktop shortcut icons, selection bounding boxes, label drop shadows. |
| **Layer 2** | `z-[15..N]` | Window Management | Floating window frames, focus contexts, drag handles, snap previews. |
| **Layer 3** | `z-40` | Centered System Taskbar | 48px fixed bottom dock, running app indicator pills, system tray widgets. |
| **Layer 4** | `z-50` | Transient Flyouts | Application Launcher Flyout, Quick Settings, Calendar, Language selector, Context Menu. |
| **Layer 5** | `z-[9999]` | Critical Modals | Eco Mode drag ghost wireframe, Lock Screen, Blue Screen of Death (BSOD) recovery. |

```
+------------------------------------------------------------------------+
| Stacking Context Diagram                                               |
+------------------------------------------------------------------------+

  Top of Screen
  +--------------------------------------------------------------------+
  | Layer 9999: System Modals / Eco Drag Wireframe / BSOD Boundary     |
  +--------------------------------------------------------------------+
    |
  +--------------------------------------------------------------------+
  | Layer 50: Application Launcher Flyout / Context Menu / Quick Set. |
  +--------------------------------------------------------------------+
    |
  +--------------------------------------------------------------------+
  | Layer 40: Centered System Taskbar (48px fixed baseline)            |
  +--------------------------------------------------------------------+
    |
  +--------------------------------------------------------------------+
  | Layer 20-39: Floating Active Windows & Focus Stack                 |
  +--------------------------------------------------------------------+
    |
  +--------------------------------------------------------------------+
  | Layer 10: Desktop App Shortcuts & Grid Anchor Canvas               |
  +--------------------------------------------------------------------+
    |
  +--------------------------------------------------------------------+
  | Layer -10: Hardware Wallpaper Layer (Transforms, Fit, Blur)        |
  +--------------------------------------------------------------------+
  Bottom of Screen
```

---

## 5. Desktop Component Tree

The top-level component topology under `src/components/desktop/DesktopEnv.tsx` organizes the entire UI hierarchy:

```
DesktopEnv
├── Dynamic Wallpaper Canvas (-z-10)
│   ├── Filter & Transform Container
│   └── System Build Watermark
├── ContextMenu (z-50, transient conditional)
├── DesktopIcon Grid (z-10)
│   ├── About App Shortcut
│   ├── Projects App Shortcut
│   ├── Skills App Shortcut
│   ├── Experience App Shortcut
│   ├── Terminal App Shortcut
│   ├── Settings App Shortcut
│   └── Trash App Shortcut
├── Window Management Layer (z-20 to z-39)
│   ├── WindowFrame [id="about"] -> AboutApp
│   ├── WindowFrame [id="projects"] -> ProjectsApp
│   ├── WindowFrame [id="skills"] -> SkillsApp
│   ├── WindowFrame [id="experience"] -> ExperienceApp
│   ├── WindowFrame [id="terminal"] -> TerminalApp
│   ├── WindowFrame [id="settings"] -> SettingsApp
│   └── WindowFrame [id="trash"] -> TrashApp
└── Centered System Taskbar (z-40)
    ├── Left Brand Widget ("RadjaOS")
    ├── Center Launcher Dock
    │   ├── Application Launcher Toggle Button
    │   ├── Global Search Button
    │   └── Running App Indicators & Badges
    ├── Right System Tray
    │   ├── Chevron Overflow
    │   ├── Language Switcher Pill
    │   ├── Unified Quick Settings Pill (WiFi, Volume, Battery)
    │   ├── Stacked Digital Clock & Calendar Pill
    │   └── Show Desktop Extreme Right Strip
    └── Flyout Container Overlays (z-50)
        ├── Application Launcher Flyout (Start Menu)
        ├── Quick Settings Flyout
        ├── Calendar and Clock Flyout
        └── Language Selection Menu
```

---

## 6. Execution Lifecycle and Event Pipelines

### 6.1. Cold Boot and Authentication
1. `DesktopEnv` mounts in browser.
2. `checkSessionValid()` inspects localStorage.
3. If session timestamp is missing or exceeded (>7 days), `LoginScreen` renders.
4. On credential confirmation:
   - `createSession()` records `Date.now()`.
   - `isLoggedIn` evaluates to true.
   - The default application ("About Me") launches automatically with priority focus (`zIndex: 15`).

### 6.2. Audio Feedback Pipeline
System events dispatch synthetic audio pulses through `src/lib/sound.ts` via the Web Audio API without requiring bulky external media assets:
- `playWindowOpen()`: Dual sinusoidal ramp (440Hz to 880Hz, 80ms duration).
- `playWindowClose()`: Descending frequency envelope (660Hz to 220Hz, 60ms duration).
- Audio is globally silenced when `isMuted` evaluates to true.

### 6.3. System Recovery and Fault Simulation
The environment includes a diagnostic fault simulator (BSOD) triggered via the terminal or power menu:
- Unmounts standard desktop layout.
- Renders an authentic kernel fault screen at `z-[9999]`.
- Displays failure vector `radja_stack_overflow.sys` and stop code `SYSTEM_THREAD_EXCEPTION_NOT_HANDLED`.
- Self-recovers automatically after 3500ms, restoring the desktop environment and launching the terminal.
