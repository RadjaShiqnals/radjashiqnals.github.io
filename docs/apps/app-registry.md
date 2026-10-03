# RadjaOS Application Registry: Architecture and Manifest

Technical specification for the RadjaOS Application Registry, window configuration manifest, routing triggers, lifecycle state machine, and process coordination model.

---

## 1. Registry Architecture Overview

RadjaOS employs a centralized application registry that acts as the single source of truth for all software components executing within the web desktop environment. The registry decouples window presentation logic from internal application payloads, enabling declarative window instantiation, deterministic z-index layering, process lifecycle supervision, and cross-application messaging.

```
+-------------------------------------------------------------------------------+
|                       RadjaOS Application Registry Architecture               |
+-------------------------------------------------------------------------------+
|                                                                               |
|   +-----------------------+     +-------------------+     +---------------+   |
|   | Desktop Icon Engine   |     | Taskbar Controller|     | Start Menu    |   |
|   +-----------+-----------+     +---------+---------+     +-------+-------+   |
|               |                           |                       |           |
|               +-------------------> [ Dispatcher ] <--------------+           |
|                                           |                                   |
|                                           v                                   |
|                        +-------------------------------------+                |
|                        |     Central App Registry Manifest   |                |
|                        |     (AppId, Geometry, State, Props) |                |
|                        +------------------+------------------+                |
|                                           |                                   |
|                                           v                                   |
|                        +-------------------------------------+                |
|                        |      Desktop Window Manager (DWM)   |                |
|                        +------------------+------------------+                |
|                                           |                                   |
|       +-----------------+-----------------+-----------------+                 |
|       |                 |                 |                 |                 |
|       v                 v                 v                 v                 |
|  [ WindowFrame ]   [ WindowFrame ]   [ WindowFrame ]   [ WindowFrame ]        |
|  (App: about)      (App: projects)   (App: terminal)   (App: settings)        |
+-------------------------------------------------------------------------------+
```

---

## 2. Default Applications Manifest

RadjaOS provisions seven core applications by default. Each entry contains strict geometric constraints, identity descriptors, visual assets, and activation pathways.

### Master Registry Table

| App ID | Title | Asset Path | Dimensions (W x H) | Min Constraints | Default State | Z-Index Base |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `about` | About Me | `/image/win11/thispc.png` | `720px x 480px` | `380px x 320px` | Open (on boot) | 10 |
| `projects` | Projects | `/image/win11/explorer.png` | `820px x 550px` | `460px x 380px` | Closed | 1 |
| `skills` | Skills | `/image/win11/vscode.png` | `750px x 490px` | `400px x 360px` | Closed | 1 |
| `experience` | Experience | `/image/win11/edge.png` | `700px x 500px` | `380px x 360px` | Closed | 1 |
| `terminal` | Terminal | `/image/win11/terminal.png` | `680px x 440px` | `420px x 280px` | Closed | 1 |
| `settings` | Settings | `/image/win11/settings.png` | `620px x 520px` | `400px x 400px` | Closed | 1 |
| `trash` | Recycle Bin | `/image/win11/bin0.png` | `600px x 420px` | `360px x 280px` | Closed | 1 |

---

## 3. Exhaustive Application Profiles

### 3.1. About Me (`about`)
- **App ID**: `about`
- **Application Category**: System / Profile Overview
- **Display Name**: About Me (Localized via `app.about`)
- **Icon Asset URI**: `/image/win11/thispc.png`
- **Default Geometry**:
  - Initial Width: `720px`
  - Initial Height: `480px`
  - Minimum Width: `380px`
  - Minimum Height: `320px`
  - Centering Algorithm: Centered on the viewport with zero cascade offset:
    `x = Math.max(20, Math.floor((screenW - 720) / 2))`
    `y = Math.max(20, Math.floor((screenH - 480 - 48) / 2.3))`
- **Routing Triggers**:
  - Bootloader initialization: Automatically instantiated upon successful login.
  - Desktop shortcut: Double-click (or single click on touch devices) on "This PC / About Me".
  - Taskbar pinned slot: Primary slot position.
  - Start Menu pinned grid: Item index 0.
  - Terminal Command: `about` or `whoami`.
- **Component Implementation**: `AboutApp.tsx`
- **Functional Scope**: Biographic overview, professional titles (Full Stack Developer & Tech Lead), geographic coordinates (Malang / Probolinggo), social media conduits, and interactive QRIS sponsorship modal.

### 3.2. Projects Showcase (`projects`)
- **App ID**: `projects`
- **Application Category**: Portfolio / File Explorer
- **Display Name**: Projects (Localized via `app.projects`)
- **Desktop Badge Indicator**: Numeric count pill `3`
- **Icon Asset URI**: `/image/win11/explorer.png`
- **Default Geometry**:
  - Initial Width: `820px`
  - Initial Height: `550px`
  - Minimum Width: `460px`
  - Minimum Height: `380px`
  - Cascade Offset: `+20px` on X and Y relative to centered baseline.
- **Routing Triggers**:
  - Desktop shortcut: "Projects" directory folder icon.
  - Taskbar pinned slot: Position index 1.
  - Start Menu: Recommended project items and pinned grid item.
  - Inter-App Link: "View Projects" primary button inside `AboutApp`.
  - Terminal Command: `projects` or `work`.
- **Component Implementation**: `ProjectsApp.tsx`
- **Functional Scope**: Curated software engineering projects, tech stack badges, repository hyperlinks, live URL integration, and interactive image gallery modal with screenshot pagination.

### 3.3. Technical Skills (`skills`)
- **App ID**: `skills`
- **Application Category**: Developer Tools / Specifications
- **Display Name**: Skills (Localized via `app.skills`)
- **Icon Asset URI**: `/image/win11/vscode.png`
- **Default Geometry**:
  - Initial Width: `750px`
  - Initial Height: `490px`
  - Minimum Width: `400px`
  - Minimum Height: `360px`
  - Cascade Offset: `+20px` on X and Y relative to baseline.
- **Routing Triggers**:
  - Desktop shortcut: "Code / Skills" icon.
  - Taskbar pinned slot: Position index 2.
  - Start Menu: Pinned grid item index 2.
  - Terminal Command: `skills`.
- **Component Implementation**: `SkillsApp.tsx`
- **Functional Scope**: Categorized engineering capabilities (Frontend, Backend, DevOps, Architecture, Database, Tools), proficiency tier indicators, and technology inventory.

### 3.4. Professional Experience (`experience`)
- **App ID**: `experience`
- **Application Category**: Enterprise Telemetry / Career Log
- **Display Name**: Experience (Localized via `app.experience`)
- **Icon Asset URI**: `/image/win11/edge.png`
- **Default Geometry**:
  - Initial Width: `700px`
  - Initial Height: `500px`
  - Minimum Width: `380px`
  - Minimum Height: `360px`
  - Cascade Offset: `+20px` on X and Y relative to baseline.
- **Routing Triggers**:
  - Desktop shortcut: "Experience" icon.
  - Taskbar pinned slot: Position index 3.
  - Start Menu: Pinned grid item index 3.
  - Inter-App Link: Career history timeline hyperlink inside `AboutApp`.
  - Terminal Command: `experience` or `history`.
- **Component Implementation**: `ExperienceApp.tsx`
- **Functional Scope**: Chronological engineering leadership history, SIDIGS architectural stewardship, milestone summaries, and technical responsibilities.

### 3.5. Radja Terminal Emulator (`terminal`)
- **App ID**: `terminal`
- **Application Category**: Shell Runtime / CLI Environment
- **Display Name**: Terminal (Localized via `app.terminal`)
- **Icon Asset URI**: `/image/win11/terminal.png`
- **Default Geometry**:
  - Initial Width: `680px`
  - Initial Height: `440px`
  - Minimum Width: `420px`
  - Minimum Height: `280px`
  - Cascade Offset: `+20px` on X and Y relative to baseline.
- **Routing Triggers**:
  - Desktop shortcut: "Terminal" icon.
  - Taskbar pinned slot: Position index 4.
  - Desktop context menu: Right-click -> "Open in Terminal".
  - Start Menu: Pinned grid item index 4.
  - Inter-App Link: Terminal badge trigger inside `AboutApp`.
- **Component Implementation**: `TerminalApp.tsx`
- **Functional Scope**: RadjaShell interactive command parser, `fetch`/`sysinfo` telemetry with 4-tile ASCII art, system control scripts, sound triggers, and easter eggs.

### 3.6. System Settings (`settings`)
- **App ID**: `settings`
- **Application Category**: Control Panel / System Preferences
- **Display Name**: Settings (Localized via `app.settings`)
- **Icon Asset URI**: `/image/win11/settings.png`
- **Badge Trigger**: Displays potato status indicator if Potato Mode is engaged.
- **Default Geometry**:
  - Initial Width: `620px`
  - Initial Height: `520px`
  - Minimum Width: `400px`
  - Minimum Height: `400px`
  - Cascade Offset: `+20px` on X and Y relative to baseline.
- **Routing Triggers**:
  - Desktop shortcut: "Settings" gear icon.
  - Taskbar pinned slot: Position index 5.
  - Start Menu: Bottom system strip and pinned grid.
  - Quick Settings Flyout: Gear icon in system tray flyout.
  - Desktop context menu: Right-click -> "Personalize".
  - Terminal Command: `settings`.
- **Component Implementation**: `SettingsApp.tsx`
- **Functional Scope**: Wallpaper library selector, custom wallpaper upload and cropping via Canvas, IndexedDB storage engine, Potato Mode toggle (GPU blur disable), audio mute control, locale switcher (EN, ID, JP), and session testing.

### 3.7. Recycle Bin (`trash`)
- **App ID**: `trash`
- **Application Category**: File System Maintenance / Graveyard
- **Display Name**: Recycle Bin (Localized via `app.trash`)
- **Icon Asset URI**: `/image/win11/bin0.png` (Empty) / `/image/win11/bin1.png` (Occupied)
- **Desktop Badge Indicator**: `999GB`
- **Default Geometry**:
  - Initial Width: `600px`
  - Initial Height: `420px`
  - Minimum Width: `360px`
  - Minimum Height: `280px`
  - Cascade Offset: `+20px` on X and Y relative to baseline.
- **Routing Triggers**:
  - Desktop shortcut: "Recycle Bin" icon on desktop grid.
  - Start Menu: Pinned grid item index 6.
  - Terminal Command: `trash` or `rm`.
- **Component Implementation**: `TrashApp.tsx`
- **Functional Scope**: Repository of discarded developer artifacts (`node_modules`, legacy dependencies, deprecated scripts), item metadata inspector, mock "Empty Recycle Bin" action with sound effects, and humorous warning dialogues.

---

## 4. TypeScript Architecture and Interfaces

```typescript
// Type definition for all registered application IDs
export type AppId =
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "terminal"
  | "settings"
  | "trash";

// Window lifecycle states
export type WindowLifecycleState =
  | "closed"
  | "opening"
  | "active"
  | "inactive"
  | "minimized"
  | "maximized"
  | "closing";

// Geometric constraints for application windows
export interface IWindowGeometry {
  initialWidth: number;
  initialHeight: number;
  minWidth: number;
  minHeight: number;
  defaultPosition?: {
    x: number;
    y: number;
  };
}

// Complete application registration manifest entry
export interface IAppRegistration {
  id: AppId;
  titleKey: string;
  iconPath: string;
  category: "system" | "portfolio" | "utilities" | "shell";
  geometry: IWindowGeometry;
  allowMultipleInstances: boolean;
  defaultOpenOnBoot: boolean;
  requiresSessionAuth: boolean;
  badge?: string;
  routingTriggers: {
    desktopShortcut: boolean;
    taskbarPin: boolean;
    startMenuPin: boolean;
    contextMenuOption?: string;
    terminalCommand?: string;
  };
}

// Window state tracking within the desktop manager
export interface IWindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

// Master registry mapping dictionary
export type ApplicationRegistryManifest = Record<AppId, IAppRegistration>;
```

---

## 5. Window Lifecycle State Machine

Each application window transitions through a deterministic state machine managed by `DesktopEnv.tsx`:

```
              +--------------------------+
              |          Closed          |
              +-------------+------------+
                            |
                     [ openApp(id) ]
                            |
                            v
              +--------------------------+
       +----> |      Active / Focused    | <----+
       |      +-------------+------------+      |
       |                    |                   |
 [ restoreApp(id) ]  [ minimizeApp(id) ]  [ focusApp(id) ]
       |                    |                   |
       |                    v                   |
       |      +--------------------------+      |
       +----- |         Minimized        |      |
              +--------------------------+      |
                            |                   |
                            |             +-----+--------------------+
                            |             |   Inactive / Unfocused   |
                            |             +--------------------------+
                            |                           ^
                            |       [ Blur / Background ]
                            +---------------------------+
                            |
                    [ closeApp(id) ]
                            |
                            v
              +--------------------------+
              |          Closed          |
              +--------------------------+
```

### Transition Invariants

1. **Focus Mutual Exclusion**: Only one application window can possess `isFocused: true` at any given timestamp. The focused application holds the highest numerical `zIndex`.
2. **Audio Feedback**:
   - `openApp`: Invokes `playWindowOpen()` (rising chime).
   - `closeApp`: Invokes `playWindowClose()` (soft descending tone).
   - `error / panic`: Invokes `playErrorBeep()`.
3. **Z-Index Layering**:
   - Active window: Top z-index (incremented sequentially: `topZ + 1`).
   - Open inactive windows: Prior assigned z-indices (`1` through `topZ - 1`).
   - Taskbar container: Fixed elevation `z-40`.
   - Start Menu and Quick Settings flyouts: High priority `z-50`.
   - Modals and Lightboxes: System critical `z-50` / `z-[60]`.

---

## 6. Instance Management Policy

- **Single-Instance Enforcement**: In the current architecture, all seven default applications are singletons. Invoking `openApp(id)` for an already active window will:
  1. Check if `isMinimized: true`. If true, set `isMinimized: false`.
  2. Bring the existing window to the forefront by updating its `zIndex` to `topZ + 1`.
  3. Set `activeWindowId` to `id`.
  4. Avoid re-mounting the internal React component tree, preserving internal scroll positions and state.

---

## 7. Testing and Verification Protocols

| Test Case | Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| `REG-TEST-01` | Launch `projects` from Desktop Icon | Window mounts with `width: 820px, height: 550px`, elevated to top z-index | Pass |
| `REG-TEST-02` | Trigger `projects` from Terminal CLI | Window opens; terminal output confirms launch; focus transitions | Pass |
| `REG-TEST-03` | Re-open already open minimized window | Window un-minimizes immediately without DOM remount | Pass |
| `REG-TEST-04` | Taskbar running indicator pill check | Pill expands under active open apps; darkens under minimized apps | Pass |
| `REG-TEST-05` | Potato Mode badge trigger on Settings | When Potato Mode is active, badge renders indicator string | Pass |
