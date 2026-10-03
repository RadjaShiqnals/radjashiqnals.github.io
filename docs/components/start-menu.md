# Application Launcher Flyout Component Specification

## 1. Component Overview and Architecture

The Application Launcher Flyout (traditionally known as the Start Menu) is implemented in `src/components/desktop/Taskbar.tsx`. It provides a centralized command, search, application launching, and system power orchestration center within the RadjaOS Web Desktop Environment.

Architectural highlights:
- **Spatial Anchoring**: Centered horizontally above the taskbar at `bottom: 56px` (`bottom-14 inset-x-0 mx-auto`).
- **Precision Dimensions**: Fixed 560px desktop width, 520px height, responsive clamp for small viewports.
- **Acrylic Surface Treatment**: Hardware-accelerated backdrop blur (`backdrop-blur-2xl`), saturated translucent base (`rgba(36, 36, 36, 0.82)`), 16px corner radius (`rounded-2xl`), and entrance keyframes (`.animate-win-flyout`).
- **Click-Outside Dismissal**: Global pointer-down event capture listener evaluating containment boundaries.

---

## 2. Structural Blueprint and Sub-Sections

The flyout is structured into four primary vertical regions:

```
+---------------------------------------------------------------------------------+
| Application Launcher Flyout (560px width x 520px height, z-index: 50)           |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | [Search] Type here to search apps, settings, and documents                |  |
|  +---------------------------------------------------------------------------+  |
|                                                                                 |
|  Pinned Apps (4 cols mobile, 6 cols desktop)                     All apps >     |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+         |
|  | [Icon] |  | [Icon] |  | [Icon] |  | [Icon] |  | [Icon] |  | [Icon] |         |
|  | About  |  | Projects  Skills   |  | Exp.   |  | Terminal  Settings |         |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+         |
|  | [Icon] |  | [Icon] |  | [Icon] |                                             |
|  | Trash  |  | GitHub |  | LinkedIn                                             |
|  +--------+  +--------+  +--------+                                             |
|                                                                                 |
|  Recommended Items (2-Column Grid)                              Recent activity |
|  +-------------------------------------+ +------------------------------------+ |
|  | [Icon] MommyScript Transpiler       | | [Icon] SIDIGS Tech Lead            | |
|  |        Featured Core Project        | |        East Java School Ecosystem  | |
|  +-------------------------------------+ +------------------------------------+ |
|  +-------------------------------------+ +------------------------------------+ |
|  | [Icon] Radja Genta Profile.md       | | [Icon] PowerShell / Neofetch       | |
|  |        Resume & Background          | |        CLI Simulator               | |
|  +-------------------------------------+ +------------------------------------+ |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | (Avatar) Radja Genta Saputra                                      [Power] |  |
|  |          Junior Full Stack Developer                                      |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Top Search Input Bar

The search bar is positioned at the top of the flyout, providing instant search across registered applications, system settings, and documents.

```tsx
<div className="p-4 sm:p-5 pb-2 sm:pb-3">
  <div className="relative">
    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Type here to search apps, settings, and documents"
      autoFocus
      className="w-full h-10 pl-10 pr-4 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-all shadow-inner"
    />
  </div>
</div>
```

### 3.1. Real-Time Query Filtering
The component executes client-side string filtering against localized application names:

```typescript
const filteredApps = taskbarApps.filter((app) =>
  t(app.nameKey, locale).toLowerCase().includes(searchQuery.toLowerCase())
);
```

---

## 4. Pinned Applications Grid

The Pinned section displays primary system shortcuts alongside verified external profiles.

### 4.1. Responsive Column Geometry
- **Mobile (< 640px)**: 4 columns (`grid-cols-4`).
- **Desktop (>= 640px)**: 6 columns (`sm:grid-cols-6`).
- **Row Spacing**: `gap-y-3 gap-x-2`.

### 4.2. Shortcut Button Architecture
Each launcher item provides rich interactive feedback:
- 32x32px app icon (`w-8 h-8 object-contain drop-shadow`).
- Icon zoom on hover (`group-hover:scale-105 transition-transform`).
- Localized caption string (`text-[11px] truncate`).

```tsx
<div className="grid grid-cols-4 sm:grid-cols-6 gap-y-3 gap-x-2">
  {filteredApps.map((app) => (
    <button
      key={app.id}
      onClick={() => {
        onOpenApp(app.id);
        setIsStartOpen(false);
      }}
      className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
    >
      <img
        src={app.iconSrc}
        alt={t(app.nameKey, locale)}
        className="w-8 h-8 object-contain drop-shadow group-hover:scale-105 transition-transform"
      />
      <span className="mt-1.5 text-[11px] text-neutral-200 group-hover:text-white text-center truncate max-w-full">
        {t(app.nameKey, locale)}
      </span>
    </button>
  ))}

  {/* External shortcuts (GitHub, LinkedIn) */}
</div>
```

---

## 5. Recommended Items Section

The Recommended section presents recent files, core projects, and direct deep links into specific application states.

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
  {/* Project Deep Link */}
  <div
    onClick={() => {
      onOpenApp("projects");
      setIsStartOpen(false);
    }}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
  >
    <img src="/image/win11/explorer.png" className="w-7 h-7 object-contain" />
    <div className="text-left">
      <p className="text-xs font-medium text-white">MommyScript Transpiler</p>
      <p className="text-[10px] text-neutral-400">Featured Core Project</p>
    </div>
  </div>

  {/* Experience Deep Link */}
  <div
    onClick={() => {
      onOpenApp("experience");
      setIsStartOpen(false);
    }}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
  >
    <img src="/image/win11/edge.png" className="w-7 h-7 object-contain" />
    <div className="text-left">
      <p className="text-xs font-medium text-white">SIDIGS Tech Lead</p>
      <p className="text-[10px] text-neutral-400">East Java School Ecosystem</p>
    </div>
  </div>
</div>
```

---

## 6. Bottom User Profile Bar and Power Sub-Flyout

The footer establishes identity context and houses system execution triggers.

```
+---------------------------------------------------------------------------------+
| Bottom Footer Bar (64px height, bg-black/40 border-t border-white/10)           |
|                                                                                 |
|  [Avatar] Radja Genta Saputra                                          [Power]  |
|           Junior Full Stack Developer                                     |     |
|                                                                           v     |
|                                                       +-----------------------+ |
|                                                       | [Lock] Lock Screen    | |
|                                                       | [Warn] Crash / BSOD   | |
|                                                       | [Sync] Restart RadjaOS| |
|                                                       +-----------------------+ |
+---------------------------------------------------------------------------------+
```

### 6.1. User Profile Container
- **User Avatar**: Circular 32x32px image thumbnail (`/image/about-me-profile.png`).
- **User Name**: Radja Genta Saputra.
- **Role Text**: Localized via `t("sys.role", locale)` ("Junior Full Stack Developer").
- **Trigger**: Clicking the user block automatically launches the "About Me" application window.

### 6.2. Power Options Sub-Flyout
Clicking the Power button toggles a contextual sub-flyout (`z-index: 50`) anchored above the power trigger button:

```tsx
{isPowerMenuOpen && (
  <div className="absolute right-0 bottom-12 w-44 rounded-xl acrylic-surface p-1.5 shadow-2xl border border-white/10 space-y-1 z-50 animate-win-zoom">
    {/* Lock Screen Trigger */}
    <button
      onClick={() => {
        setIsPowerMenuOpen(false);
        setIsStartOpen(false);
        onLockScreen();
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
    >
      <Lock className="w-3.5 h-3.5 text-blue-400" />
      <span>{t("sys.lock", locale)}</span>
    </button>

    {/* BSOD Simulation Easter Egg */}
    <button
      onClick={() => {
        setIsPowerMenuOpen(false);
        setIsStartOpen(false);
        onTriggerBSOD();
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
    >
      <RotateCw className="w-3.5 h-3.5 text-rose-400" />
      <span>Crash / BSOD (Easter egg)</span>
    </button>

    {/* Restart RadjaOS Trigger */}
    <button
      onClick={() => {
        setIsPowerMenuOpen(false);
        setIsStartOpen(false);
        window.location.reload();
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
    >
      <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
      <span>Restart RadjaOS</span>
    </button>
  </div>
)}
```

---

## 7. Lifecycle and Dismissal Engine

- **Mutual Exclusivity**: Opening the Application Launcher Flyout automatically closes any active Quick Settings or Calendar flyouts.
- **Outside Interaction Trap**: A global `pointerdown` listener compares event targets against `startMenuRef.current` and button attribute `[data-start-btn]`. If the interaction originates outside both, the flyout and its power sub-menu close gracefully without state leakage.
