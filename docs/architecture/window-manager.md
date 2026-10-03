# RadjaOS Window Manager Architecture and Interaction Engine

## 1. Overview and Core Responsibilities

The RadjaOS Window Manager operates inside `src/components/desktop/WindowFrame.tsx` and is coordinated by the central desktop kernel `src/components/desktop/DesktopEnv.tsx`. It provides complete spatial management, window lifecycle tracking, drag calculation, focus arbitration, snap previews, and rendering optimization across multiple concurrent application viewports.

Key architectural requirements include:
- Strict zero-delay focus switching without layout recalculations.
- Zero React re-renders during high-frequency drag operations.
- Deterministic z-index stacking arbitration.
- Eco Mode fallback using decoupled wireframe ghosting for low-specification hardware.

---

## 2. Window Stacking Context and Focus Arbitration

Focus arbitration governs which application receives keyboard events, displays active titlebar luminosity, and renders on top of overlapping canvases.

### 2.1. Monotonic Z-Index Counter Strategy
The window manager maintains a monotonic incrementing state counter `topZ` initialized at baseline level 15:

```typescript
const [topZ, setTopZ] = useState(15);
const [windowZIndices, setWindowZIndices] = useState<Record<AppId, number>>({
  about: 10,
  projects: 1,
  skills: 1,
  experience: 1,
  terminal: 1,
  trash: 1,
  settings: 1,
});
const [activeWindowId, setActiveWindowId] = useState<AppId | null>("about");
```

### 2.2. Focus Promotion Algorithm
When a window receives focus through pointer down, titlebar drag, or hover activation, the window manager executes the following atomic sequence:

```typescript
const focusApp = (id: AppId) => {
  if (activeWindowId === id) return;
  const nextZ = topZ + 1;
  setTopZ(nextZ);
  setWindowZIndices((prev) => ({ ...prev, [id]: nextZ }));
  setActiveWindowId(id);
};
```

1. **Identity Gate**: If `activeWindowId === id`, the operation short-circuits immediately, preventing unnecessary state churn.
2. **Monotonic Stacking Promotion**: `topZ` increments by 1. The targeted window receives `nextZ`.
3. **Active Identity Assignment**: `activeWindowId` is updated to `id`. All other windows automatically transition their titlebars and borders to the inactive visual state.

### 2.3. Hover-Focus Arbitration
RadjaOS supports immediate hover-focus arbitration. When a cursor crosses into the window boundary (`onMouseEnter`), `onHoverFocus()` elevates the window if a drag sequence is not actively locked on another window:

```typescript
onMouseEnter={() => {
  if (!isDragging) {
    onHoverFocus();
  }
}}
```

---

## 3. Window Drag Mechanics and Performance Engine

Dragging arbitrary DOM structures with complex CSS backdrop filters (`backdrop-blur-2xl`) can induce severe frame drops and compositing lag if managed through standard React state bindings. RadjaOS isolates the drag pipeline entirely from React state loops.

```
+------------------------------------------------------------------------+
|                      Pointer Drag Execution Pipeline                   |
+------------------------------------------------------------------------+
                                   |
                         pointerdown on Titlebar
                                   |
                  Record Drag Delta (clientX - posX)
                                   |
                         pointermove on Window
                                   |
              Clamp Target Coordinates to Viewport Limits
                                   |
                    requestAnimationFrame Schedule Gate
                                   |
             +---------------------+---------------------+
             |                                           |
      Standard Mode                                  Eco Mode
             |                                           |
  Direct DOM Mutex Ref                        Ghost Wireframe Ref
(windowRef.style.transform)                 (ghostRef.style.transform)
             |                                           |
             +---------------------+---------------------+
                                   |
                          pointerup on Window
                                   |
                      Commit Final Position to State
                        (setPos({ x, y }))
```

### 3.1. Zero-Reconciliation Pointer Tracking
During active drags, intermediate coordinates are stored exclusively inside mutable React refs (`posRef` and `dragStart`):

```typescript
const posRef = useRef({ x: initialX, y: initialY });
const dragStart = useRef({ x: 0, y: 0 });
const rafId = useRef<number | null>(null);
```

### 3.2. Coordinate Calculation and Viewport Clamping
Coordinates are clamped to ensure the titlebar and caption controls remain reachable at all times:
```typescript
const handlePointerMove = (e: PointerEvent) => {
  const newX = Math.max(10, Math.min(window.innerWidth - 80, e.clientX - dragStart.current.x));
  const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragStart.current.y));
  posRef.current = { x: newX, y: newY };
  // Render scheduling follows...
};
```

### 3.3. RequestAnimationFrame (rAF) Render Pipeline
Intermediate coordinates are applied to the DOM via direct CSS matrix transforms (`translate3d`), completely bypassing React component tree reconciliation:

```typescript
if (!rafId.current) {
  rafId.current = requestAnimationFrame(() => {
    if (potatoMode) {
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
    } else {
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
    }
    rafId.current = null;
  });
}
```

### 3.4. Eco Mode (Potato Mode) Ghost Wireframe
On lower-performance clients, dragging a complex window surface with rich text, tables, or terminal streams introduces GPU composition bottlenecks. 

When `potatoMode === true`:
1. The actual window element remains completely stationary at its starting coordinates.
2. An ultra-lightweight vector wireframe (`ghostRef`) renders at `z-index: 9999`:
   ```tsx
   <div
     ref={ghostRef}
     style={{
       zIndex: 9999,
       left: 0,
       top: 0,
       width: `${initialWidth}px`,
       height: `${initialHeight}px`,
       transform: `translate3d(${ghostPos.x}px, ${ghostPos.y}px, 0)`,
     }}
     className="fixed border-2 border-dashed border-blue-400 bg-blue-500/10 rounded-[8px] pointer-events-none shadow-2xl"
   >
     <div className="h-9 bg-blue-500/20 border-b border-blue-400/30 px-3 flex items-center gap-2 text-xs font-mono text-blue-300">
       <span>Moving: {title}</span>
     </div>
   </div>
   ```
3. Only upon `pointerup` does the window manager hide the ghost wireframe and instantaneously snap the primary window to the committed coordinates.

---

## 4. Window Lifecycle State Machine

RadjaOS models window lifecycles through five deterministic states:
1. **Closed**: Window is unmounted from the active DOM tree (`isOpen: false`).
2. **Open / Inactive**: Mounted and visible, but lacks top z-index focus (`isOpen: true, isFocused: false`).
3. **Open / Active**: Mounted, top z-index focus, active titlebar styling (`isOpen: true, isFocused: true`).
4. **Minimized**: Retained in memory with persistent internal state, but removed from view (`isOpen: true, isMinimized: true`).
5. **Maximized**: Expanded to fill the entire desktop canvas above the taskbar (`isMaximized: true`).

```
+------------------------------------------------------------------------+
|                     Window Lifecycle State Flow                        |
+------------------------------------------------------------------------+

     +-----------------------+
     |        Closed         |<--------------------------------+
     +-----------------------+                                 |
                 |                                             |
         openApp(id)                                     closeApp(id)
                 |                                             |
                 v                                             |
     +-----------------------+     focusApp(id)    +-------------------+
     |     Open / Inactive   |-------------------->|   Open / Active   |
     +-----------------------+<--------------------+-------------------+
         ^               |        blur / other app             |
         |               |                                     |
         |         minimizeApp(id)                       minimizeApp(id)
         |               |                                     |
         |               +-----------------+-------------------+
         |                                 |
         |                                 v
         |                     +-----------------------+
         +---------------------|       Minimized       |
             taskbar click     +-----------------------+
                                           |
                                 toggleMaximizeApp(id)
                                           |
                                           v
                               +-----------------------+
                               |       Maximized       |
                               +-----------------------+
```

### 4.1. State Transition Matrix

| Current State | Event Trigger | Next State | System Actions Executed |
| :--- | :--- | :--- | :--- |
| **Closed** | `openApp(id)` | **Active** | `playWindowOpen()`, `setOpenWindows(true)`, `setTopZ(topZ + 1)`, `setActiveWindowId(id)` |
| **Active** | `closeApp(id)` | **Closed** | `playWindowClose()`, `setOpenWindows(false)`, `setActiveWindowId(null)` |
| **Active** | `minimizeApp(id)` | **Minimized** | `setMinimizedWindows(true)`, `setActiveWindowId(null)` |
| **Minimized** | `handleTaskbarItemClick(id)` | **Active** | `setMinimizedWindows(false)`, `focusApp(id)` |
| **Active** | `handleTaskbarItemClick(id)` | **Minimized** | `minimizeApp(id)` |
| **Inactive** | `focusApp(id)` | **Active** | `setTopZ(topZ + 1)`, `setActiveWindowId(id)` |
| **Active** | `toggleMaximizeApp(id)` | **Maximized** | `setMaximizedWindows(true)`, `focusApp(id)` |
| **Maximized** | `toggleMaximizeApp(id)` | **Active** | `setMaximizedWindows(false)`, `focusApp(id)` |

---

## 5. Maximization Mechanics and Viewport Docking

When a window enters the maximized state, its layout shifts from coordinate-translated floating dimensions to fixed viewport bounds:

```typescript
const windowStyle: React.CSSProperties = isMaximized
  ? {
      zIndex,
      left: 0,
      top: 0,
      width: "100vw",
      height: "calc(100vh - 48px)",
      transform: "none",
      transition: "all 0.16s cubic-bezier(0.1, 0.9, 0.2, 1)",
    }
  : {
      zIndex,
      left: 0,
      top: 0,
      width: `${initialWidth}px`,
      height: `${initialHeight}px`,
      transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      willChange: isDragging ? "transform" : "auto",
      transition: isDragging ? "none" : "width 0.16s ease-out, height 0.16s ease-out",
    };
```

Key characteristics:
- **Taskbar Clearance**: The height is constrained to `calc(100vh - 48px)`, leaving the Centered System Taskbar visible and interactable.
- **Corner Flattening**: The window borders transition from `rounded-[8px]` to `rounded-none`, and border-top/sides are removed to blend seamlessly into screen perimeters.
- **Drag Invalidation**: Dragging is disabled when `isMaximized === true`. Double-clicking the titlebar restores previous spatial dimensions.

---

## 6. Snap Layout Previews and Multi-Tasking

RadjaOS incorporates a built-in Snap Layouts preview engine directly inside the RadjaOS Caption System.

```
+--------------------------------------------------------+
| Titlebar Right Side (Caption Controls)                 |
|                                                        |
|   [ ― ]           [ □ ]                     [ ✕ ]      |
|  Minimize   Maximize / Restore              Close      |
+-----------------------|--------------------------------+
                        | (Hover Trigger)
                        v
         +------------------------------+
         | Snap layouts                 |
         | +--------------+-----------+ |
         | | [Left 50%]   | [Rt 50%]  | |
         | +--------------+-----------+ |
         | | [Left 66%]   | [Rt 33%]  | |
         | +--------------+-----------+ |
         +------------------------------+
```

### 6.1. Hover Detection and Flyout Preview
Hovering over the Maximize/Restore caption control triggers an interactive flyout menu displaying target tiling archetypes:

```tsx
<div
  className="relative h-full"
  onMouseEnter={() => setShowSnapPreview(true)}
  onMouseLeave={() => setShowSnapPreview(false)}
>
  <button onClick={onToggleMaximize} className="w-11 h-full ...">
    {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
  </button>

  {showSnapPreview && (
    <div className="absolute top-10 right-0 w-48 p-2 rounded-lg bg-[#252525]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
      <p className="text-[10px] text-neutral-400 font-medium mb-1.5 px-1">Snap layouts</p>
      <div className="grid grid-cols-2 gap-1.5">
        {/* 50-50 Split Archetype */}
        <div className="p-1 rounded bg-white/5 border border-white/10 grid grid-cols-2 gap-1 h-10">
          <div className="bg-blue-500/40 border border-blue-400/50 rounded-sm"></div>
          <div className="bg-white/10 rounded-sm"></div>
        </div>
        {/* 2/3 - 1/3 Split Archetype */}
        <div className="p-1 rounded bg-white/5 border border-white/10 grid grid-cols-3 gap-1 h-10">
          <div className="col-span-2 bg-blue-500/40 border border-blue-400/50 rounded-sm"></div>
          <div className="bg-white/10 rounded-sm"></div>
        </div>
      </div>
    </div>
  )}
</div>
```

---

## 7. Performance Invariants and Guardrails

1. **Hardware Acceleration Guarantee**: All floating coordinate changes utilize GPU composited layers via `translate3d()` and `will-change: transform`.
2. **Listener Hygiene**: Global window pointer event listeners (`pointermove`, `pointerup`) are bound only when `isDragging === true` and are unregistered immediately upon pointer release.
3. **Passive Scrolling**: Pointer move listeners pass `{ passive: true }` to ensure browser main-thread scrolling is never blocked during window management cycles.
