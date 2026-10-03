# Centered System Taskbar and Application Dock Component Specification

## 1. Component Overview and Architecture

The Centered System Taskbar (`src/components/desktop/Taskbar.tsx`) is the primary navigational and process management anchor of the RadjaOS Web Desktop Environment. It is permanently fixed to the bottom edge of the viewport at a strict 48px height baseline (`h-12`).

It fulfills three architectural functions:
1. **Left Brand and Widget Area**: Hosts the RadjaOS brand identity badge and launcher quick triggers.
2. **Center Launcher Dock**: Hosts the Application Launcher Flyout button, Global Search trigger, and running application icon array with dynamic state indicator pills.
3. **Right System Tray**: Hosts the system tray overflow button, language switcher pill, unified quick settings pill, stacked digital clock, and the extreme-right "Show Desktop" line strip.

---

## 2. Component Signature and Prop Interface

The Taskbar is implemented as a React functional component with the following signature:

```typescript
export interface TaskbarProps {
  openWindows: Record<AppId, boolean>;
  minimizedWindows: Record<AppId, boolean>;
  activeWindowId: AppId | null;
  onOpenApp: (id: AppId) => void;
  onMinimizeApp: (id: AppId) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  isMuted: boolean;
  toggleMute: () => void;
  potatoMode: boolean;
  togglePotatoMode: () => void;
  onLockScreen: () => void;
  onTriggerBSOD: () => void;
  onToggleShowDesktop: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  openWindows,
  minimizedWindows,
  activeWindowId,
  onOpenApp,
  onMinimizeApp,
  locale,
  setLocale,
  isMuted,
  toggleMute,
  potatoMode,
  togglePotatoMode,
  onLockScreen,
  onTriggerBSOD,
  onToggleShowDesktop,
}) => {
  // Internal state and DOM markup
};
```

### 2.1. Prop Specifications

| Prop Identifier | Type Definition | Description |
| :--- | :--- | :--- |
| `openWindows` | `Record<AppId, boolean>` | Hash map denoting whether each process is open or closed. |
| `minimizedWindows` | `Record<AppId, boolean>` | Hash map denoting whether an open process is currently minimized. |
| `activeWindowId` | `AppId \| null` | The identifier of the window possessing active focus and top z-index. |
| `onOpenApp` | `(id: AppId) => void` | Callback to launch an application or elevate it to top z-index. |
| `onMinimizeApp` | `(id: AppId) => void` | Callback to minimize an active application. |
| `locale` | `Locale` (`"en" \| "id" \| "ja"`) | Active internationalization dictionary code. |
| `setLocale` | `(l: Locale) => void` | Mutator to switch and persist internationalization state. |
| `isMuted` | `boolean` | Master audio muting toggle state. |
| `toggleMute` | `() => void` | Callback to toggle Web Audio API synthetic feedback. |
| `potatoMode` | `boolean` | Eco Mode flag disabling heavy GPU backdrop blur effects. |
| `togglePotatoMode` | `() => void` | Callback to toggle Eco Mode and persist state in local storage. |
| `onLockScreen` | `() => void` | Callback to invalidate active session and render Lock Screen. |
| `onTriggerBSOD` | `() => void` | Callback to trigger simulated system fault recovery screen. |
| `onToggleShowDesktop`| `() => void` | Callback to toggle minimize/restore state across all open windows. |

---

## 3. Structural Layout and Dimensions

The container uses fixed viewport positioning with Frosted Mica surface styling:

```tsx
<footer className="fixed bottom-0 left-0 right-0 h-12 bg-[#1c1c1c]/80 backdrop-blur-3xl border-t border-white/10 z-40 flex items-center justify-between px-2 sm:px-3 select-none">
  {/* Left: Brand / Widget */}
  {/* Center: Launcher Dock */}
  {/* Right: System Tray */}
</footer>
```

```
+---------------------------------------------------------------------------------------------------------+
| Fixed Bottom 48px Container (z-index: 40)                                                               |
|                                                                                                         |
|  [Sparkles RadjaOS]      [Start] [Search] [App 1] [App 2] ... [App N]      [^] [ENG] [WiFi/Vol] [Clock] |
|  |<-- Left Area -->|     |<---------- Center System Dock ---------->|      |<------- System Tray ------>|
+---------------------------------------------------------------------------------------------------------+
```

### 3.1. Surface Token Specifications
- **Height**: Strict `48px` (`h-12`).
- **Surface Recipe**: `bg-[#1c1c1c]/80 backdrop-blur-3xl border-t border-white/10`.
- **Elevation Z-Index**: `40` (rendered above floating windows at z-20 through z-39, but beneath flyouts at z-50).

---

## 4. Left Brand and Widget Area

Positioned on the left edge of the taskbar:

```tsx
<div className="hidden lg:flex items-center gap-2 pl-1 min-w-[120px]">
  <button
    onClick={() => {
      playWindowOpen();
      setIsStartOpen(!isStartOpen);
    }}
    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-xs text-neutral-300 hover:text-white cursor-pointer"
  >
    <Sparkles className="w-4 h-4 text-blue-400" />
    <span className="text-[11px] font-medium tracking-wide">RadjaOS</span>
  </button>
</div>
```

- **Breakpoint Responsive**: Rendered only on large displays (`hidden lg:flex`), preserving taskbar horizontal bandwidth on compact viewports.
- **Interactivity**: Clicking the brand pill activates the Application Launcher Flyout.

---

## 5. Center Launcher Dock and Running Indicator Pills

The central dock hosts the primary interactive items, centered horizontally with `mx-auto`.

```
Center Dock Item Layout:
+-----------------------------------------------------------------------------------------+
|  [Start Button]   [Search Button]   [App Icon 1]   [App Icon 2]   [App Icon 3]  ...     |
|   (4-Tile Logo)     (Magnifier)        (Icon)         (Icon)         (Icon)             |
|                                       [======]         [==]                             |
|                                        Active        Inactive                           |
|                                       (16px Cyan)   (6px Slate)                         |
+-----------------------------------------------------------------------------------------+
```

### 5.1. Start Launcher Button
Uses the distinct RadjaOS 4-Tile Brand Badge:
```tsx
<button
  data-start-btn
  onClick={() => {
    playWindowOpen();
    setIsStartOpen(!isStartOpen);
    setIsQuickSettingsOpen(false);
    setIsCalendarOpen(false);
  }}
  className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center transition-all cursor-pointer ${
    isStartOpen ? "bg-white/15" : "hover:bg-white/10 active:scale-95"
  }`}
  title="Start"
>
  <svg viewBox="0 0 88 88" className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform drop-shadow">
    <rect x="2" y="2" width="38" height="38" rx="7" fill="#0078d4" />
    <rect x="48" y="2" width="38" height="38" rx="7" fill="#60cdff" />
    <rect x="2" y="48" width="38" height="38" rx="7" fill="#005a9e" />
    <rect x="48" y="48" width="38" height="38" rx="7" fill="#0078d4" />
  </svg>
</button>
```

### 5.2. Running Indicator Pill Animation and States
Every application button checks its running state (`isOpen`) and focus state (`isActive`):

```tsx
{isOpen && (
  <span
    className={`absolute bottom-0.5 rounded-full transition-all duration-200 ${
      isActive
        ? "w-3.5 sm:w-4 h-[3px] bg-[#60cdff] group-hover:w-5"
        : "w-1.5 h-[3px] bg-neutral-400 group-hover:w-3"
    }`}
  />
)}
```

#### Running Indicator State Matrix

| Application State | Pill Width | Pill Height | Pill Color Token | Hover Width | Visual Meaning |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Active Focused** | `16px` (`w-4`) | `3px` | `#60cdff` (Brand Cyan) | `20px` (`w-5`) | Window is currently focused at top z-index. |
| **Inactive Open** | `6px` (`w-1.5`) | `3px` | `#94a3b8` (Slate Neutral) | `12px` (`w-3`) | Window is open in background or minimized. |
| **Closed / Pinned** | None | None | None | None | Application is closed; icon acts as quick launcher. |

### 5.3. Item Click Interaction Logic
```typescript
const handleTaskbarItemClick = (id: AppId) => {
  if (openWindows[id]) {
    if (activeWindowId === id) {
      // Active window clicked: minimize it
      onMinimizeApp(id);
    } else {
      // Open window clicked: focus and bring to front
      onOpenApp(id);
    }
  } else {
    // Not open: launch new instance
    onOpenApp(id);
  }
};
```

---

## 6. Right System Tray

The right section of the taskbar aggregates status widgets, toggles, and screen controls.

```
+---------------------------------------------------------------------------------+
| Right System Tray                                                               |
|                                                                                 |
|  [^]     [ENG]        [ (WiFi) (Vol) (Bat) ]      11:42 PM            | |       |
| Overflow Language     Unified Quick Settings      10/3/2026           | |       |
| Chevron  Switcher     Pill                        Stacked Clock       Show      |
|                       (Network, Sound, Power)     & Calendar          Desktop   |
+---------------------------------------------------------------------------------+
```

### 6.1. Language Switcher Pill
Displays the current active locale (`EN`, `ID`, `JP`):
```tsx
<button
  data-lang-btn
  onClick={() => {
    setIsLangMenuOpen(!isLangMenuOpen);
    setIsQuickSettingsOpen(false);
    setIsCalendarOpen(false);
  }}
  className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors uppercase font-mono cursor-pointer"
>
  {locale}
</button>
```

### 6.2. Unified Quick Settings Pill
Bundles network status, volume state, and battery indicator into a single contiguous interactive button:
```tsx
<button
  data-quicksettings-btn
  onClick={() => {
    playWindowOpen();
    setIsQuickSettingsOpen(!isQuickSettingsOpen);
    setIsStartOpen(false);
    setIsCalendarOpen(false);
  }}
  className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
    isQuickSettingsOpen ? "bg-white/10" : ""
  }`}
>
  <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300" />
  {isMuted ? (
    <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500" />
  ) : (
    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300" />
  )}
  <BatteryCharging className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
</button>
```

### 6.3. Stacked Digital Clock and Calendar Pill
Presents real-time 12-hour formatted time and calendar date stacked vertically:
```tsx
<button
  data-calendar-btn
  onClick={() => {
    playWindowOpen();
    setIsCalendarOpen(!isCalendarOpen);
    setIsStartOpen(false);
    setIsQuickSettingsOpen(false);
  }}
  className={`flex flex-col items-end px-1.5 py-0.5 sm:px-2 rounded-md text-right hover:bg-white/10 transition-colors cursor-pointer ${
    isCalendarOpen ? "bg-white/10" : ""
  }`}
>
  <span className="text-[11px] font-normal text-neutral-200 tracking-tight leading-none">
    {currentTime}
  </span>
  <span className="hidden sm:inline text-[10px] text-neutral-400 leading-tight mt-0.5">
    {currentDate}
  </span>
</button>
```

### 6.4. Extreme Right "Show Desktop" Strip
An ultra-narrow vertical target positioned on the far right perimeter:
```tsx
<button
  onClick={onToggleShowDesktop}
  className="hidden sm:block w-1.5 hover:w-2 h-7 border-l border-white/15 hover:bg-white/20 transition-all ml-1 cursor-pointer"
  title="Show desktop"
/>
```
- **Action**: When clicked, evaluates all open windows. If any window is visible, all windows are minimized. If all open windows are already minimized, they are restored to visible state.

---

## 7. Accessibility and Focus Standards

1. **Touch Target Expansion**: Buttons adjust from `w-9 h-9` on mobile to `w-10 h-10` on desktop, satisfying touch ergonomics.
2. **Interactive Affordances**: All buttons declare `cursor-pointer`, `hover:bg-white/10`, and `active:scale-95` tactile responses.
3. **Keyboard Dismissal**: All associated flyouts listen for global Escape keydown and outside pointer clicks to close safely.
