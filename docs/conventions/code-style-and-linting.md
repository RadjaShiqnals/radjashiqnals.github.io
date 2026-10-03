# RadjaOS Code Style, Typing, and Linting Conventions

Engineering specifications for TypeScript typing standards, React component lifecycles, Tailwind utility ordering, and static analysis guidelines within RadjaOS.

---

## 1. Architectural Principles

RadjaOS is engineered with a strict emphasis on performance, type safety, deterministic state lifecycles, and code maintainability. To sustain 60+ FPS window manipulation across diverse client hardware (including the low-overhead Potato Mode), the codebase enforces strict coding conventions across all layers.

---

## 2. TypeScript Strict Mode and Typing Conventions

### 2.1. Compiler Configuration Standards
All sub-projects and components must compile under strict TypeScript compiler rules. The project `tsconfig.json` enforces:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2. Type versus Interface Allocation Rules

1. **Use `interface` for Declarative Object Contracts**:
   - Component props (`interface WindowFrameProps { ... }`)
   - Data entity models (`interface ProjectItem { ... }`)
   - Extensible state structures and domain objects.

2. **Use `type` for Compositions and Primitives**:
   - Unions and enums (`type AppId = "about" | "projects" | ...`)
   - Tuple declarations
   - Conditional types and mapped utilities (`type Nullable<T> = T | null`)
   - Event callback handler signatures (`type WindowCloseHandler = (id: AppId) => void`)

### 2.3. Naming Conventions

| Identifier Type | Standard | Rule / Example | Prohibited Anti-Pattern |
| :--- | :--- | :--- | :--- |
| **Interfaces** | PascalCase | `WindowConfig`, `AppMetadata` | `IWindowConfig` (Hungarian `I` banned) |
| **Types** | PascalCase | `AppId`, `TerminalExitCode` | `TAppId` (Hungarian `T` banned) |
| **Component Props** | PascalCase | `<ComponentName>Props` (e.g. `TaskbarProps`) | `Props`, `TaskbarInterface` |
| **React Components** | PascalCase | `DesktopEnv`, `TerminalApp` | `desktopEnv`, `terminal_app` |
| **Custom Hooks** | camelCase | `useWindowDrag`, `useActiveSession` | `WindowDragHook` |
| **Constants** | UPPER_SNAKE | `SESSION_KEY`, `DEFAULT_WINDOW_Z` | `session_key`, `defaultWindowZ` |
| **Functions / Methods**| camelCase | `openApp`, `calculateWindowCentering` | `OpenApp`, `open_app` |

### 2.4. Explicit Return Types
All exported helper functions, data transformers, and custom hooks must declare explicit return types to accelerate compiler verification and prevent accidental signature drift:

```typescript
// Recommended
export function checkSessionValid(): { valid: boolean; expired: boolean } {
  // implementation
}

// Prohibited (Implicit return type)
export function checkSessionValid() {
  // implementation
}
```

---

## 3. React Component Engineering Patterns

### 3.1. Props Interface Architecture
Component props must be declared as an explicit interface directly above the component definition in the same file:

```typescript
import React from "react";
import { type Locale } from "../../lib/i18n";
import { type AppId } from "../../lib/os-state";

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
  // ...
}) => {
  // Component logic
};
```

### 3.2. Ref Handling and Memory Safety
High-frequency interactions such as window dragging, resizing, and terminal caret positioning must avoid unthrottled React re-renders.

```typescript
// Recommended: Direct DOM reference updates during dragging
const windowRef = useRef<HTMLDivElement>(null);
const posRef = useRef({ x: initialX, y: initialY });
const rafId = useRef<number | null>(null);

const handlePointerMove = (e: PointerEvent) => {
  const newX = e.clientX - dragStart.current.x;
  const newY = e.clientY - dragStart.current.y;
  posRef.current = { x: newX, y: newY };

  if (!rafId.current) {
    rafId.current = requestAnimationFrame(() => {
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
      rafId.current = null;
    });
  }
};
```

### 3.3. Effect Cleanup Discipline
All subscriptions, timers, requestAnimationFrame callbacks, and window-level event listeners must register explicit teardown logic in the `useEffect` return block:

```typescript
useEffect(() => {
  if (!isDragging) return;

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };
}, [isDragging]);
```

---

## 4. Tailwind CSS Utility Grouping Standard

To preserve readability across complex JSX elements, Tailwind CSS utility classes must be organized using a five-tier priority order:

```
[ Tier 1: Layout & Display ] ──> [ Tier 2: Sizing & Box Model ] ──> [ Tier 3: Typography ]
                                                                             │
                                                                             ▼
[ Tier 5: Transitions & Pseudo ] <── [ Tier 4: Backgrounds & Borders ] <─────┘
```

### 4.1. The 5-Tier Ordering Specification

1. **Tier 1: Layout and Positioning**:
   - `flex`, `grid`, `inline-flex`, `block`, `hidden`
   - `relative`, `absolute`, `fixed`, `sticky`
   - `top-`, `bottom-`, `left-`, `right-`, `inset-`
   - `z-`, `overflow-`, `col-span-`
2. **Tier 2: Sizing, Spacing, and Geometry**:
   - `w-`, `h-`, `min-w-`, `max-w-`, `min-h-`, `max-h-`
   - `p-`, `px-`, `py-`, `pt-`, `pb-`
   - `m-`, `mx-`, `my-`, `-m-`
   - `gap-`, `gap-x-`, `gap-y-`, `space-y-`
3. **Tier 3: Typography and Content**:
   - `font-mono`, `font-sans`, `font-bold`, `font-medium`
   - `text-xs`, `text-sm`, `text-base`, `text-[11px]`
   - `tracking-tight`, `leading-relaxed`, `text-center`, `truncate`
   - `text-white`, `text-neutral-300`, `text-blue-400`
4. **Tier 4: Backgrounds, Surfaces, and Borders**:
   - `bg-white/[0.04]`, `bg-neutral-950/80`, `bg-blue-600`
   - `border`, `border-white/10`, `border-b`
   - `rounded-xl`, `rounded-full`, `rounded-[8px]`
   - `divide-y`, `divide-white/5`
5. **Tier 5: Effects, Transitions, and Pseudo-classes**:
   - `shadow-lg`, `shadow-black/50`, `backdrop-blur-md`
   - `hover:`, `active:`, `focus:`, `focus-visible:`
   - `transition-all`, `transition-colors`, `duration-150`
   - `cursor-pointer`, `select-none`, `group`

### 4.2. Example Comparison

```html
<!-- Recommended: Formatted according to the 5-Tier Rule -->
<button className="flex items-center justify-between w-full p-3 text-xs font-semibold text-neutral-200 bg-white/[0.04] border border-white/[0.08] rounded-xl shadow-md hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-[0.99] transition-all duration-150 cursor-pointer">
  <span>Execute Action</span>
</button>

<!-- Prohibited: Unsorted, chaotic utility tokens -->
<button className="hover:bg-white/[0.08] text-xs p-3 rounded-xl flex duration-150 border-white/[0.08] active:scale-[0.99] font-semibold text-neutral-200 bg-white/[0.04] w-full border transition-all cursor-pointer shadow-md justify-between items-center hover:border-white/[0.15]">
  <span>Execute Action</span>
</button>
```

---

## 5. State Management and Persistence Architecture

### 5.1. LocalStorage Key Standardization
All persistent browser storage keys must use the `radjaos_` namespace prefix to prevent collision with other applications:

```typescript
export const STORAGE_KEYS = {
  SESSION_TIMESTAMP: "radjaos_session_timestamp",
  POTATO_MODE: "radjaos_potato_mode",
  WALLPAPER_CONFIG: "radjaos_wallpaper_config",
  LOCALE_PREFERENCE: "radjaos_locale",
  SOUND_MUTED: "radjaos_sound_muted",
} as const;
```

### 5.2. Custom Event Messaging Bus
When cross-component state synchronization is required outside React component trees (such as notifying components of a wallpaper change initiated from Settings), components dispatch and listen to typed custom events:

```typescript
export const WALLPAPER_CHANGE_EVENT = "radjaos:wallpaper_changed";

// Dispatching
export function dispatchWallpaperChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WALLPAPER_CHANGE_EVENT));
  }
}

// Subscribing
useEffect(() => {
  const handler = () => refreshWallpaperState();
  window.addEventListener(WALLPAPER_CHANGE_EVENT, handler);
  return () => window.removeEventListener(WALLPAPER_CHANGE_EVENT, handler);
}, []);
```

### 5.3. Binary Data Handling with IndexedDB
Large binary assets (such as user-uploaded wallpapers) must never be stored as Base64 strings in `localStorage` due to the synchronous 5MB quota constraint. They must be routed through IndexedDB (`radjaos-db`) using `Blob` storage with asynchronous Promise wrappers.

---

## 6. Defensive Programming and Error Boundaries

1. **Window Guarding**: Always guard `window`, `document`, and `localStorage` accesses with `typeof window !== "undefined"` to maintain compatibility with Astro static site generation (SSG).
2. **Fallback Values for State**: Use nullish coalescing operators (`??`) rather than logical OR (`||`) when evaluating boolean or numerical settings.
3. **Safe JSON Parsing**: Wrap all `JSON.parse` operations in defensive `try/catch` blocks that default to fallback presets if user storage is corrupted.
