# Window Chrome and RadjaOS Caption System Specification

## 1. Component Overview and Architecture

The Window Chrome container (`src/components/desktop/WindowFrame.tsx`) wraps all native desktop application viewports inside the RadjaOS Web Desktop Environment. It establishes the window's spatial boundary, manages hardware dragging transformations, renders titlebar metadata, and hosts the proprietary RadjaOS Caption System.

Key visual attributes:
- **Titlebar Baseline**: 36px to 38px height container with unified drag capabilities.
- **Surface Elevation**: Frosted Glass Acrylic & Mica recipes with dynamic focus luminosity.
- **Corner Radius**: 8px (`rounded-[8px]`) in floating window mode, flattening to `rounded-none` when maximized.
- **RadjaOS Caption System**: Three dedicated action triggers (Minimize, Maximize/Restore with Snap Preview, and Close with crimson hover).

---

## 2. Component Signature and Prop Interface

```typescript
export interface WindowFrameProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  isMobile: boolean;
  potatoMode: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onHoverFocus: () => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  icon,
  iconSrc,
  isOpen,
  isMinimized,
  isMaximized,
  isFocused,
  zIndex,
  initialX = 120,
  initialY = 70,
  initialWidth = 720,
  initialHeight = 480,
  isMobile,
  potatoMode,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onHoverFocus,
  children,
}) => {
  // Component implementation
};
```

### 2.1. Prop Specifications

| Prop Identifier | Type Definition | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique process identity matching the application registration. |
| `title` | `string` | Localized title string displayed in the titlebar. |
| `icon` | `React.ReactNode` | Optional SVG/Lucide icon component. |
| `iconSrc` | `string` | Absolute or relative URL to the 16x16px application glyph. |
| `isOpen` | `boolean` | Lifecycle mount state. If false, component renders null. |
| `isMinimized` | `boolean` | Minimize state. If true, component renders null. |
| `isMaximized` | `boolean` | Maximized state filling 100vw and viewport height minus taskbar. |
| `isFocused` | `boolean` | Denotes whether this window currently owns the top z-index focus. |
| `zIndex` | `number` | Computed stacking context index. |
| `initialX` | `number` | Initial horizontal viewport offset (default: 120px). |
| `initialY` | `number` | Initial vertical viewport offset (default: 70px). |
| `initialWidth` | `number` | Default floating width in pixels (e.g., 720px, 820px). |
| `initialHeight`| `number` | Default floating height in pixels (e.g., 480px, 550px). |
| `isMobile` | `boolean` | Form-factor switch. Converts window to bottom sheet when true. |
| `potatoMode` | `boolean` | Eco Mode switch. Replaces GPU blur with solid background and ghost drag. |
| `onClose` | `() => void` | Event handler dispatched when the close caption button is triggered. |
| `onMinimize` | `() => void` | Event handler dispatched when the minimize caption button is triggered. |
| `onToggleMaximize` | `() => void` | Event handler dispatched when the maximize caption button is triggered. |
| `onFocus` | `() => void` | Pointer-down callback elevating the window to top z-index. |
| `onHoverFocus`| `() => void` | Mouse-enter callback elevating the window during cursor movement. |
| `children` | `React.ReactNode` | The encapsulated application view body. |

---

## 3. Titlebar Structural Layout (38px Baseline)

The titlebar is structured into three discrete zones:
1. **Left Metadata Area**: App icon (16x16px) and window title text.
2. **Center Drag Handle Area**: Flexible hit area that intercepts pointer-down events.
3. **Right Caption Controls Area**: RadjaOS Caption System buttons.

```
+-----------------------------------------------------------------------------------------+
| Window Titlebar (38px height baseline)                                                  |
|                                                                                         |
|  [Icon] Window Title          (Flexible Draggable Handle)          [ ― ]   [ □ ]  [ ✕ ] |
|  |<-- Left Metadata -->|     |<------- Center Drag Zone ------->|  |<-- RadjaOS Caption ->|
+-----------------------------------------------------------------------------------------+
```

### 3.1. DOM Implementation
```tsx
<div
  onPointerDown={handleTitleBarPointerDown}
  onDoubleClick={onToggleMaximize}
  className={`h-9 shrink-0 flex items-center justify-between select-none ${
    isFocused ? "bg-white/[0.03]" : "bg-transparent"
  } ${isMaximized ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-default"}`}
>
  {/* Left: App Icon & Window Title */}
  <div className="flex items-center gap-2 pl-3 pointer-events-none">
    {iconSrc ? (
      <img src={iconSrc} alt={title} className="w-4 h-4 object-contain" />
    ) : (
      icon
    )}
    <span
      className={`text-xs font-normal tracking-wide transition-colors ${
        isFocused ? "text-neutral-200" : "text-neutral-400"
      }`}
    >
      {title}
    </span>
  </div>

  {/* Center: Draggable Spacer */}
  <div className="flex-1 h-full"></div>

  {/* Right: RadjaOS Caption System */}
  <div className="flex items-center h-full">
    {/* Caption buttons */}
  </div>
</div>
```

### 3.2. Drag Handle Mechanics
- Clicking anywhere on the titlebar initiates pointer dragging via `handleTitleBarPointerDown`.
- Double-clicking the titlebar toggles maximization via `onDoubleClick={onToggleMaximize}`.
- Sub-elements with `pointer-events-none` allow dragging through the title text.
- Caption buttons explicitly intercept `e.stopPropagation()` to prevent dragging while clicking action buttons.

---

## 4. RadjaOS Caption System Specification

The RadjaOS Caption System governs window lifecycle actions. It consists of three high-precision buttons positioned flush with the right boundary of the titlebar.

```
+-------------------------------------------------------------------+
| RadjaOS Caption Controls Array                                    |
|                                                                   |
|   +--------------------+--------------------+-----------------+   |
|   |   Minimize ('―')   | Maximize ('□'/'❐') |   Close ('✕')   |   |
|   |   Width: 44px      | Width: 44px        |   Width: 44px   |   |
|   |   Hover: white/10  | Hover: white/10    |   Hover: Crimson|   |
|   +--------------------+--------------------+-----------------+   |
+-------------------------------------------------------------------+
```

### 4.1. Minimize Control ('―')
- **Glyph**: Horizontal dash (`Minus` icon, 14x14px).
- **Dimensions**: `w-11 h-full` (44px width x 36-38px height).
- **Hover State**: `hover:bg-white/10 text-neutral-300 hover:text-white`.
- **Action**: Dispatches `onMinimize()`. Hides the window while maintaining running indicator state in the taskbar.

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    onMinimize();
  }}
  className="w-11 h-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
  title="Minimize"
>
  <Minus className="w-3.5 h-3.5" />
</button>
```

### 4.2. Maximize and Restore Control ('□' / '❐')
- **Glyphs**:
  - Restored / Floating: Single square (`Square` icon, 12x12px).
  - Maximized: Overlapping dual rectangle (`Copy` icon rotated 180 degrees, 12x12px).
- **Dimensions**: `w-11 h-full` (44px width x 36-38px height).
- **Hover State**: `hover:bg-white/10 text-neutral-300 hover:text-white`.
- **Snap Layouts Preview Engine**: Hovering over this button triggers an absolute flyout preview displaying 50/50 and 2/3 - 1/3 split screen archetypes.
- **Action**: Dispatches `onToggleMaximize()`.

```tsx
<div
  className="relative h-full"
  onMouseEnter={() => setShowSnapPreview(true)}
  onMouseLeave={() => setShowSnapPreview(false)}
>
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggleMaximize();
    }}
    className="w-11 h-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
    title={isMaximized ? "Restore" : "Maximize"}
  >
    {isMaximized ? (
      <Copy className="w-3 h-3 rotate-180" />
    ) : (
      <Square className="w-3 h-3" />
    )}
  </button>
</div>
```

### 4.3. Close Control ('✕' with Crimson Red Hover)
- **Glyph**: Cross mark (`X` icon, 14x14px).
- **Dimensions**: `w-11 h-full` (44px width x 36-38px height).
- **Visual Styling**: Standard neutral text color in resting state. On hover, transitions immediately to rich crimson red (`#c42b1c`), shifting to dark crimson on active click (`#b22617`).
- **Sound Trigger**: Invokes synthetic audio descending pulse via `playWindowClose()`.
- **Action**: Dispatches `onClose()`. Unmounts window and removes focus lock.

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    playWindowClose();
    onClose();
  }}
  className="w-11 h-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#c42b1c] active:bg-[#b22617] transition-colors cursor-pointer"
  title="Close"
>
  <X className="w-3.5 h-3.5" />
</button>
```

---

## 5. Window Body and Frosted Glass Styling

The window body encapsulates application-specific DOM trees. It provides frosted glass visual depth, custom scrollbar tracks, and distinct active versus inactive states.

### 5.1. Dynamic Glass Surface Classes
Surface recipes adapt based on focus, drag, and Eco Mode:

```typescript
const getWindowClasses = () => {
  if (potatoMode) {
    if (isFocused) {
      return "bg-[#1f1f1f] border-white/20 shadow-2xl shadow-black";
    }
    return "bg-[#181818] border-white/10 shadow-lg shadow-black/80 opacity-95";
  }

  if (isDragging) {
    return "bg-[#202020]/90 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/90";
  }
  if (isFocused) {
    return "bg-[#202020]/88 backdrop-blur-2xl border-white/15 shadow-2xl shadow-black/80 ring-1 ring-white/10";
  }
  return "bg-[#1a1a1a]/85 backdrop-blur-xl border-white/10 shadow-lg shadow-black/60 opacity-95 hover:opacity-100 transition-opacity duration-150";
};
```

### 5.2. Window Canvas Container
```tsx
<div className="flex-1 overflow-y-auto p-5 text-neutral-200 selection:bg-blue-600/50 bg-[#1e1e1e]/60">
  {children}
</div>
```

- **Scrollbar Behavior**: Styled using translucent webkit scrollbar thumbs (`rgba(255, 255, 255, 0.16)`).
- **Text Selection**: Custom blue selection pill (`selection:bg-blue-600/50`).
- **Base Canvas Hue**: Semi-translucent dark canvas (`bg-[#1e1e1e]/60`) allowing filtered wallpaper illumination to subtly permeate the workspace.
