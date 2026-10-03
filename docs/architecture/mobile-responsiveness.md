# RadjaOS Mobile Responsiveness and Form-Factor Adaptation Architecture

## 1. Overview and Design Philosophy

While RadjaOS provides a multi-window, floating-surface desktop paradigm on desktop displays, running traditional free-floating windows on handheld mobile viewports (<768px) creates critical usability constraints:
- Window drag coordinates frequently clip outside narrow viewports.
- Micro caption buttons (11px text targets) violate mobile touch-target guidelines (WCAG 2.5.5 minimum 44x44px).
- Multiple overlapping surfaces cause severe visual occlusion on high-DPI screens.

To overcome these constraints, RadjaOS implements an adaptive form-factor engine that dynamically morphs between two distinct interaction architectures based on viewport width:
1. **Desktop Paradigm (>= 768px)**: Floating, multi-tasking overlapping windows with spatial drag, snap previews, and complete taskbar dock shortcuts.
2. **Mobile Sheet Paradigm (< 768px)**: Full-viewport bottom sheets, simplified mobile caption controls, 3-column desktop shortcuts grid, and an adaptive taskbar showing exclusively active processes.

```
+------------------------------------------------------------------------+
|                   Form-Factor Adaptation Matrix                        |
+------------------------------------------------------------------------+
  Feature                 Desktop (>= 768px)          Mobile (< 768px)
  ----------------------------------------------------------------------
  Window Presentation     Floating Rectangles         Fixed Inset Sheet
  Window Bounds           User-defined (drag/resize)  Fixed (inset-0 bottom-12)
  RadjaOS Caption System  Minimize, Maximize, Close   Minimize, Close (No Max)
  Desktop App Icons       Vertical Flex Column        3-Column Dense Grid
  Taskbar Dock App Icons  All Pinned Apps + Running   Running / Open Apps Only
  Taskbar Left Area       Branded Widget Display      Hidden
  Taskbar Right Tray      Clock, Date, Tray, Lang     Compact Clock, Lang, Pill
  Input Optimization      Hover, Pointer Tracking     Touch Bounds, Passive Drag
```

---

## 2. Viewport Detection and State Synchronization

The viewport transformation is driven by reactive resize observation inside `src/components/desktop/DesktopEnv.tsx`:

```typescript
const [isMobile, setIsMobile] = useState<boolean>(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

The computed `isMobile` boolean propagates down the component tree into `WindowFrame`, `DesktopIcon`, and layout wrappers.

---

## 3. Mobile Sheet Window Mode

When `isMobile === true`, the Window Manager completely bypasses spatial position calculation (`pos.x`, `pos.y`), drag listeners, and snap preview tooltips. Instead, the window renders as a dedicated, full-screen mobile sheet:

```tsx
if (isMobile) {
  return (
    <div
      className="fixed inset-0 bottom-12 bg-[#1e1e1e] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
      style={{ zIndex: zIndex || 40 }}
      onClick={onFocus}
    >
      {/* 40px Compact Mobile Titlebar */}
      <div className="h-10 bg-[#252525] border-b border-white/10 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-xs text-white truncate max-w-[65vw]">
          {iconSrc ? (
            <img src={iconSrc} alt={title} className="w-4 h-4 object-contain shrink-0" />
          ) : (
            icon
          )}
          <span className="truncate">{title}</span>
        </div>

        {/* Mobile RadjaOS Caption Controls (Minimize & Close Only) */}
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playWindowClose();
              onMinimize();
            }}
            className="w-10 h-10 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playWindowClose();
              onClose();
            }}
            className="w-10 h-10 hover:bg-[#c42b1c] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Body with Taskbar Clearance */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 text-neutral-200">
        {children}
      </div>
    </div>
  );
}
```

```
+--------------------------------------------------------+
| Mobile Sheet Mode Architecture (< 768px)               |
+--------------------------------------------------------+
| [Icon] Window Title (Max 65vw)          [ ― ]   [ ✕ ]  |  <- 40px Header
+--------------------------------------------------------+
|                                                        |
|                                                        |
|                                                        |
|                   Scrollable Body                      |
|                 (Native Touch Scroll)                  |
|                                                        |
|                                                        |
|                                                        |
|               (Clearance Padding: pb-20)               |
+--------------------------------------------------------+
| Centered System Taskbar (Fixed Bottom 48px Baseline)   |  <- 48px Dock
+--------------------------------------------------------+
```

### 3.1. Architectural Attributes of Mobile Sheet Mode
- **Taskbar Clearance Inset**: The container is bound to `fixed inset-0 bottom-12`, guaranteeing the Centered System Taskbar remains permanently visible at the base of the viewport.
- **Omission of Maximize Control**: Because the sheet inherently consumes all available vertical and horizontal space, the maximize/restore button and snap layout triggers are omitted.
- **Enlarged Touch Target Boundaries**: Caption buttons expand from the desktop compact standard to full 40x40px hitboxes (`w-10 h-10`), preventing missed taps.
- **Hardware-Accelerated Entrance Physics**: The sheet enters the screen via CSS slide-up and alpha fade transitions (`slide-in-from-bottom-5 duration-200`).
- **Internal Content Cushion**: Content bodies feature `pb-20` padding to guarantee floating action buttons, forms, or scrollable tables never become occluded behind the taskbar.

---

## 4. 3-Column Desktop Launcher Grid on Mobile Screens

On desktop displays, application shortcuts render as a vertical column grid pinned to the top-left boundary of the desktop. On mobile devices, this layout reflows into a high-density 3-column launcher grid.

```
Desktop Mode (>= 768px):
+-------------------------------+
| [Icon] About Me               |
| [Icon] Projects               |
| [Icon] Skills                 |
| [Icon] Experience             |
| [Icon] Terminal               |
| [Icon] Settings               |
| [Icon] Recycle Bin            |
+-------------------------------+

Mobile Mode (< 768px):
+--------------------------------------------------------+
|   [Icon]           [Icon]             [Icon]           |
|  About Me         Projects            Skills           |
|                                                        |
|   [Icon]           [Icon]             [Icon]           |
| Experience        Terminal           Settings          |
|                                                        |
|   [Icon]                                               |
| Recycle Bin                                            |
+--------------------------------------------------------+
```

### 4.1. DOM Implementation and CSS Tokens
In `src/components/desktop/DesktopEnv.tsx`:

```tsx
<div className="pt-6 sm:pt-4 pb-20 px-4 sm:px-3 grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-col md:flex-wrap gap-y-5 gap-x-2 md:gap-2 w-full max-w-sm sm:max-w-md md:w-fit md:h-full z-10 pointer-events-auto">
  <DesktopIcon
    label={t("app.about", locale)}
    iconSrc="/image/win11/thispc.png"
    onClick={() => openApp("about")}
  />
  <DesktopIcon
    label={t("app.projects", locale)}
    badge="3"
    iconSrc="/image/win11/explorer.png"
    onClick={() => openApp("projects")}
  />
  {/* Additional application shortcuts... */}
</div>
```

### 4.2. Layout Specifications Across Breakpoints
1. **Narrow Viewport (< 640px)**: `grid grid-cols-3`, `gap-y-5`, `gap-x-2`. Three balanced columns providing accessible tap areas for thumbs.
2. **Intermediate Tablet (640px - 767px)**: `sm:grid-cols-4`. Four columns preventing excessive icon stretching.
3. **Desktop Workstation (>= 768px)**: `md:flex md:flex-col md:flex-wrap md:w-fit md:h-full`. Traditional left-aligned desktop column placement.

---

## 5. Adaptive Centered System Taskbar Dock

On mobile displays, horizontal space inside the 48px bottom taskbar is limited. Displaying 7 pinned apps, brand icons, clocks, and quick settings simultaneously would cause severe overflow.

RadjaOS resolves this through an adaptive dock filtering model inside `src/components/desktop/Taskbar.tsx`.

```
+------------------------------------------------------------------------+
|                  Adaptive Taskbar Dock Architecture                    |
+------------------------------------------------------------------------+

Desktop Viewport (>= 768px):
+------------------------------------------------------------------------+
| [RadjaOS] |   [Start] [Search] [App1] [App2] [App3] [App4]   | [Tray]  |
+------------------------------------------------------------------------+
  (Left Brand)               (All Pinned Apps)                 (Full Tray)

Mobile Viewport (< 768px):
+------------------------------------------------------------------------+
|           |   [Start] [Search] [Running App1] [Running App2] | [Compact]|
+------------------------------------------------------------------------+
  (Hidden)              (Open / Active Apps Only)              (Compact)
```

### 5.1. Conditional Item Visibility Logic
Every application shortcut checks `isOpen`:

```tsx
{taskbarApps.map((app) => {
  const isOpen = openWindows[app.id];
  const isMin = minimizedWindows[app.id];
  const isActive = activeWindowId === app.id && !isMin;

  return (
    <button
      key={app.id}
      onClick={() => handleTaskbarItemClick(app.id)}
      className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-md items-center justify-center transition-all cursor-pointer ${
        isOpen ? "flex" : "hidden md:flex"
      } ${
        isActive
          ? "bg-white/10"
          : isOpen
          ? "hover:bg-white/10"
          : "hover:bg-white/5 active:scale-95"
      }`}
      title={t(app.nameKey, locale)}
    >
      {/* App Icon and Indicator Pill */}
    </button>
  );
})}
```

- When `isOpen === false`: The class `hidden md:flex` suppresses the icon on screens under 768px while maintaining it on desktop displays.
- When `isOpen === true`: The element receives `flex`, rendering immediately into the mobile taskbar dock alongside its active running indicator pill.

### 5.2. System Tray Mobile Compression
The system tray compresses its presentation on mobile widths:
- The left brand widget (`Sparkles + RadjaOS`) is hidden (`hidden lg:flex`).
- The tray overflow chevron is hidden (`hidden sm:flex`).
- The date string underneath the digital clock is hidden (`hidden sm:inline`), displaying solely the current time (`hh:mm AM/PM`).
- The extreme-right "Show Desktop" line strip is hidden (`hidden sm:block`) to prevent accidental taps at the screen edge.

---

## 6. Touch-Specific Interaction Invariants

1. **Touch Target Sizing**: All mobile-accessible buttons enforce minimum bounds of 36x36px to 40x40px.
2. **Context Menu Guardrails**: Long-press and right-click context menus automatically calculate coordinates clamped within mobile bounds to prevent off-screen rendering.
3. **No Horizontal Window Drift**: By utilizing fixed inset sheet containers, mobile windows cannot be dragged horizontally off the screen by user gestures.
