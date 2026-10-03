# Desktop Context Menu Component Specification

## 1. Overview and Architecture

The Desktop Context Menu (`src/components/desktop/ContextMenu.tsx`) provides contextual system actions, canvas refresh triggers, display personalization, and application launcher shortcuts when secondary pointer events (right-clicks or long-press gestures) occur over the desktop workspace.

Architectural highlights:
- **Canvas-Targeted Interception**: Bound directly to the root desktop canvas while strictly ignoring secondary clicks originating inside open window viewports (`.window-frame`) or the bottom taskbar (`footer`).
- **Dynamic Boundary Clamping**: Real-time coordinate translation ensuring the 224px wide menu never clips across the right or bottom viewport perimeter.
- **Deep Acrylic Surface Recipe**: Translucent acrylic glass styling (`rgba(34, 34, 34, 0.82)`) with 40px backdrop blur and entrance zoom animation (`.animate-win-zoom`).
- **Universal Dismissal**: Automatically closes upon global pointer down, viewport resize, escape keydown, or menu item execution.

---

## 2. Component Signature and Prop Interface

```typescript
export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  onRefresh: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onOpenApp,
  onRefresh,
}) => {
  // Component implementation
};
```

### 2.1. Prop Specifications

| Prop Identifier | Type Definition | Description |
| :--- | :--- | :--- |
| `x` | `number` | Raw client horizontal coordinate from the pointer event (`e.clientX`). |
| `y` | `number` | Raw client vertical coordinate from the pointer event (`e.clientY`). |
| `onClose` | `() => void` | Callback invoked to unmount the context menu from state. |
| `onOpenApp` | `(id: AppId) => void` | Callback to launch an application associated with a menu item. |
| `onRefresh` | `() => void` | Callback to execute synthetic audio and desktop refresh routines. |

---

## 3. Desktop Event Capture and Exemption Zones

The context menu event is captured at the root desktop wrapper in `src/components/desktop/DesktopEnv.tsx`:

```tsx
<div
  className="relative w-screen h-screen overflow-hidden bg-[#0c1017] select-none"
  onContextMenu={(e) => {
    // Exemption Filter: Ignore clicks inside active windows or the system taskbar
    if (
      (e.target as HTMLElement).closest(".window-frame") ||
      (e.target as HTMLElement).closest("footer")
    ) {
      return;
    }
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }}
  onClick={() => {
    if (contextMenu) setContextMenu(null);
  }}
>
  {contextMenu && (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={() => setContextMenu(null)}
      onOpenApp={openApp}
      onRefresh={() => {
        playWindowOpen();
      }}
    />
  )}
</div>
```

### 3.1. Filter Rules
1. **Window Exemption**: If `closest(".window-frame")` returns true, the browser event propagation continues, allowing application-internal context menus (e.g., text selection or terminal copying) to function without interruption.
2. **Taskbar Exemption**: If `closest("footer")` returns true, the event is ignored to preserve taskbar right-click behavior.
3. **Desktop Canvas Hit**: When the click occurs on the wallpaper or desktop icon grid background, `e.preventDefault()` halts default browser menus, and coordinates `{ x, y }` mount the RadjaOS Context Menu.

---

## 4. Viewport Coordinate Clamping Algorithm

When right-clicking near screen perimeters, displaying the menu at raw `(x, y)` coordinates would cause the menu to overflow outside the visible viewport. RadjaOS enforces coordinate boundary clamping:

```
+-------------------------------------------------------------------------+
| Viewport Clamping Boundary                                              |
|                                                                         |
|  Click (x, y)                                                           |
|       *                                                                 |
|       +-----------------------+                                         |
|       | Context Menu          |                                         |
|       | Width: 224px          |                                         |
|       | Height: ~320px        |                                         |
|       +-----------------------+                                         |
|                                                     Screen Right Edge   |
|                                                                       | |
|                                                                       v |
|  Click Near Perimeter (x, y)                                            |
|                                                  *                      |
|                                     +-----------------------+           |
|                                     | Clamped Menu Position |           |
|                                     | adjustedX = W - 240   |           |
|                                     +-----------------------+           |
|                                                                         |
|  -------------------------------------------------- Taskbar Limit ----- |
|  adjustedY = H - 340                                                    |
+-------------------------------------------------------------------------+
```

### 4.1. Implementation
```typescript
const adjustedX = Math.min(x, window.innerWidth - 240);
const adjustedY = Math.min(y, window.innerHeight - 340);
```

- **Horizontal Clamping**: Constrains horizontal offset to `window.innerWidth - 240px` (allocating 224px for menu width plus a 16px safety margin).
- **Vertical Clamping**: Constrains vertical offset to `window.innerHeight - 340px` (allocating 320px for full menu height plus the 48px taskbar boundary).

---

## 5. Visual Styling and Surface Tokens

The context menu utilizes deep Acrylic surface aesthetics:

```tsx
<div
  ref={menuRef}
  style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
  className="fixed z-50 w-56 rounded-xl acrylic-surface p-1.5 shadow-2xl border border-white/10 text-xs text-neutral-200 select-none animate-win-zoom space-y-0.5"
>
  {/* Menu Items */}
</div>
```

### 5.1. Surface Token Specifications
- **Width**: Strict `224px` (`w-56`).
- **Corner Radius**: `12px` (`rounded-xl`).
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`.
- **Elevation Shadow**: Multi-layered high-diffuse shadow (`shadow-2xl shadow-black/80`).
- **Entrance Animation**: `.animate-win-zoom` (scales from 0.96 to 1.0 with 0.15s cubic-bezier ease).

---

## 6. Menu Action Matrix and Event Handlers

The menu defines an ergonomic layout divided into functional action clusters separated by subtle 1px dividers (`h-px bg-white/10 my-1`):

```
+-------------------------------------------------------------+
| Context Menu Action Topology                                |
+-------------------------------------------------------------+
|  [Grid]   View                                              |
|  [Sort]   Sort by                                           |
|  [Sync]   Refresh                                           |
|  ---------------------------------------------------------  |
|  [Folder] New folder (Opens Projects App)                   |
|  ---------------------------------------------------------  |
|  [Mon]    Display settings (Opens Settings App)             |
|  [Gear]   Personalize (Opens Settings Wallpaper Tab)        |
|  [Term]   Open in Terminal (Opens Terminal App)             |
|  ---------------------------------------------------------  |
|  [Info]   About RadjaOS (Opens About App)                   |
+-------------------------------------------------------------+
```

### 6.1. Action Item Specifications

| Action Item | Glyph Token | Handler Invocation | System Action |
| :--- | :--- | :--- | :--- |
| **View** | `LayoutGrid` | `onClose()` | Dismisses menu. Reserved for grid view layout options. |
| **Sort by** | `ArrowUpDown` | `onClose()` | Dismisses menu. Reserved for icon sorting rules. |
| **Refresh** | `RotateCw` | `onRefresh(); onClose()` | Triggers desktop redraw and plays synthetic audio chirp. |
| **New folder** | `FolderPlus` | `onOpenApp("projects"); onClose()` | Launches Projects application window. |
| **Display settings**| `Monitor` | `onOpenApp("settings"); onClose()` | Launches Settings application window. |
| **Personalize** | `Settings` | `playWindowOpen(); onOpenApp("settings"); onClose()` | Launches Settings application with sound. |
| **Open in Terminal**| `Terminal` | `playWindowOpen(); onOpenApp("terminal"); onClose()` | Launches Terminal application with sound. |
| **About RadjaOS** | `Info` | `playWindowOpen(); onOpenApp("about"); onClose()` | Launches primary About Me application. |

---

## 7. Dismissal and Focus Invariants

1. **Escape Key Interception**: A global window keydown listener intercepts `Escape` to immediately dismiss the context menu.
2. **Outside Pointer Down**: Clicks outside `menuRef.current` unmount the menu immediately before downstream events fire.
3. **Execution Auto-Close**: Every menu button triggers `onClose()` upon click, preventing stale overlays from persisting on the workspace.
