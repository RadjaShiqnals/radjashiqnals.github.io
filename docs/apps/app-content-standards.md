# RadjaOS Application Content Standards and Design Tokens

Technical design system, component presentation standards, typography metrics, and UI token specifications for views rendered within RadjaOS window canvases.

---

## 1. Architectural Scope and Visual Philosophy

The RadjaOS desktop presentation layer adheres to a refined, dark, translucent aesthetic engineered for desktop productivity. Applications render within a host `WindowFrame` component that provides acrylic or mica chrome, caption buttons, and viewport boundary management.

Application internal content must adhere to strict visual tokens:
- **Depth and Materiality**: Semi-transparent dark surfaces with subtle light borders simulate physical glass surfaces.
- **Micro-Interactions**: Smooth 150ms-200ms easing transitions across hover and active states.
- **Content Density**: Efficient spacing allowing data density without visual clutter.
- **High Contrast Typography**: Pure white headers paired with slate and neutral body text to ensure maximum legibility.

---

## 2. Window Canvas Layout Specifications

Applications instantiated within RadjaOS run in one of two canonical body layout architectures:

### 2.1. Standard Padded Canvas (`StandardLayout`)
Used by `AboutApp`, `ProjectsApp`, `SkillsApp`, `ExperienceApp`, `SettingsApp`, and `TrashApp`.

```
+-------------------------------------------------------------------------+
| Window Titlebar (Chrome: 38px)                                          |
+-------------------------------------------------------------------------+
| Window Body: overflow-y-auto, p-6                                       |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | App Header Section (Title, Subtitle, Action Controls)           |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | Content Grid / List (Cards, Metrics, Badges)                    |   |
|   |                                                                 |   |
|   |   +-----------------------+     +-----------------------+       |   |
|   |   | Card Surface          |     | Card Surface          |       |   |
|   |   | bg-white/[0.04]       |     | bg-white/[0.04]       |       |   |
|   |   | border-white/[0.08]   |     | border-white/[0.08]   |       |   |
|   |   +-----------------------+     +-----------------------+       |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
+-------------------------------------------------------------------------+
```

- **Container Classes**: `space-y-6 max-w-4xl mx-auto`
- **Body Scrollbar Tokens**: Custom subtle thumb (`bg-white/10 hover:bg-white/20 rounded-full`) with transparent track.
- **Top / Bottom Margins**: Controlled via parent `WindowFrame` body container.

### 2.2. Full-Bleed Terminal Canvas (`FullBleedLayout`)
Used exclusively by `TerminalApp`.

- **Container Classes**: `h-full flex flex-col font-mono text-xs bg-neutral-950/80 -m-5 p-4 rounded-b-xl overflow-hidden cursor-text`
- **Negative Margin Compensation**: `-m-5` cancels parent window padding to establish edge-to-edge terminal boundaries.
- **Corner Masking**: Bottom corners rounded (`rounded-b-xl`) to conform to window border geometry.

---

## 3. Card Surface Design Tokens

Cards serve as the foundational content container for grouping related data, project entries, experience items, and settings options.

### 3.1. Design Token Matrix

| Token Name | Computed Value | Tailwind Classes | Description |
| :--- | :--- | :--- | :--- |
| `surface-card-base` | `rgba(255, 255, 255, 0.04)` | `bg-white/[0.04]` | Resting background fill |
| `surface-card-hover` | `rgba(255, 255, 255, 0.08)` | `hover:bg-white/[0.08]` | Pointer hover background fill |
| `surface-card-active` | `rgba(0, 120, 212, 0.12)` | `active:bg-blue-600/20` | Pressed or selected state |
| `border-card-subtle` | `rgba(255, 255, 255, 0.08)` | `border border-white/[0.08]` | Primary separation stroke |
| `border-card-hover` | `rgba(255, 255, 255, 0.16)` | `hover:border-white/[0.16]` | Interactive hover border |
| `border-card-accent` | `rgba(0, 120, 212, 0.5)` | `border-blue-500/50` | Active selection border |
| `radius-card` | `12px` | `rounded-xl` | Standard card corner curvature |
| `shadow-card` | `0 10px 25px -5px rgba(0,0,0,0.4)` | `shadow-lg shadow-black/40` | Subtle elevation drop shadow |

### 3.2. Potato Mode Overrides
When Potato Mode is active, all dynamic backdrop filters and translucent alpha channels are disabled to minimize GPU compositor draw calls:
- Background fallback: `#1c1c1c` (`bg-neutral-900`)
- Border fallback: `1px solid rgba(255, 255, 255, 0.15)`
- Shadow: `none` or static low-cost box-shadow

---

## 4. Interactive Element Styling

### 4.1. Buttons

RadjaOS specifies four button classifications: Primary Accent, Secondary Neutral, Ghost, and Destructive.

```
+---------------------------------------------------------------------------------+
| Button Classification Matrix                                                    |
+---------------------------------------------------------------------------------+
| [ Primary Accent ]   bg-blue-600 hover:bg-blue-500 text-white rounded-lg       |
| [ Secondary Neutral] bg-white/10 hover:bg-white/15 text-neutral-200 border-w/10 |
| [ Ghost Action ]     bg-transparent hover:bg-white/5 text-neutral-300          |
| [ Destructive ]      bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border  |
+---------------------------------------------------------------------------------+
```

#### Detailed Classes

```html
<!-- 1. Primary Accent Button -->
<button class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400">
  Primary Action
</button>

<!-- 2. Secondary Neutral Button -->
<button class="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/10 text-xs font-medium transition-colors duration-150 cursor-pointer">
  Secondary Action
</button>

<!-- 3. Ghost Action Button -->
<button class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-colors duration-150 cursor-pointer">
  Ghost Action
</button>

<!-- 4. Destructive Action Button -->
<button class="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors duration-150 cursor-pointer">
  Delete / Purge
</button>
```

### 4.2. Status Badges and Chips

Badges render compact metadata, categorization, and system states:

| Badge Type | Color Palette | Tailwind Implementation | Usage Context |
| :--- | :--- | :--- | :--- |
| **Accent / Role** | Blue (`#38bdf8`) | `bg-blue-500/10 border border-blue-500/20 text-blue-400` | Tech Lead badge, Project count |
| **Success / Active**| Emerald (`#34d399`) | `bg-emerald-500/10 border border-emerald-500/20 text-emerald-400` | Status online, Skill verified |
| **Warning / Alert** | Amber (`#fbbf24`) | `bg-amber-500/10 border border-amber-500/20 text-amber-300` | Trash alert, deprecation note |
| **Neutral / Tag** | Slate (`#94a3b8`) | `bg-white/5 border border-white/10 text-neutral-300` | Tech stack tag (React, Tailwind) |
| **Monospace Counter**| Emerald / Slate | `font-mono text-[10px] px-1.5 py-0.5 rounded` | Memory usage, byte sizes |

### 4.3. External Hyperlinks

External conduits must be clearly delineated from internal navigation triggers:
- **Icon Requirement**: Must include a trailing `ExternalLink` icon (12px x 12px, `w-3 h-3`).
- **Target Invariant**: Always assign `target="_blank"`.
- **Security Invariant**: Always assign `rel="noopener noreferrer"`.
- **Styling**: `inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline text-xs transition-colors`.

---

## 5. Modal and Lightbox Presentation Standards

Applications that surface high-density visual media (e.g., `ProjectsApp` screenshot lightbox, `AboutApp` QRIS modal, `SettingsApp` wallpaper cropper) must adhere to the standard modal overlay contract.

### Modal Layout Anatomy

```
+-------------------------------------------------------------------------------+
| Lightbox Backdrop: fixed inset-0 z-50 bg-black/80 backdrop-blur-md            |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   | Modal Frame: max-w-2xl bg-neutral-900/95 border border-white/15       |   |
|   |                                                                       |   |
|   |  [Modal Header]                           [Close Button: 'X']         |   |
|   |  Title: text-base font-bold text-white                                |   |
|   |  -----------------------------------------------------------------    |   |
|   |  [Modal Body Viewport]                                                |   |
|   |  - Media Container: rounded-lg border border-white/10                 |   |
|   |  - Aspect Ratio: preserved (contain or cover)                         |   |
|   |  -----------------------------------------------------------------    |   |
|   |  [Modal Footer / Controls]                                            |   |
|   |  Pagination: [< Prev]  [2 / 5]  [Next >]                              |   |
|   +-----------------------------------------------------------------------+   |
|                                                                               |
+-------------------------------------------------------------------------------+
```

### Keyboard and Dismissal Rules

1. **Backdrop Click**: Clicking outside the modal container invokes `onClose()`.
2. **Escape Key**: An active `keydown` listener listening for `Escape` triggers immediate dismissal.
3. **Scroll Lock**: The underlying window body must retain independent scroll state without leaking scroll events to the backdrop.

---

## 6. Accessibility (a11y) Standards

1. **Focus Ring Indication**: All interactive buttons, links, and inputs must incorporate explicit visible focus rings:
   `focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:outline-none`
2. **Semantic Elements**: Use semantic tags (`<article>`, `<section>`, `<header>`, `<button>`, `<nav>`) rather than arbitrary `<div>` nesting.
3. **Text Contrast Ratios**: Ensure minimum WCAG AA contrast ratio of 4.5:1 for body copy against translucent card backgrounds.
4. **Descriptive Labels**: Interactive icon-only buttons must provide explicit `aria-label` or `title` attributes.

---

## 7. TypeScript UI Token Definitions

```typescript
export interface ICardThemeTokens {
  background: string;
  backgroundHover: string;
  border: string;
  borderHover: string;
  borderRadius: string;
  boxShadow: string;
}

export const RADJAOS_CARD_TOKENS: ICardThemeTokens = {
  background: "rgba(255, 255, 255, 0.04)",
  backgroundHover: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderHover: "1px solid rgba(255, 255, 255, 0.16)",
  borderRadius: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
};

export const RADJAOS_POTATO_CARD_TOKENS: ICardThemeTokens = {
  background: "#1c1c1c",
  backgroundHover: "#262626",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderHover: "1px solid rgba(255, 255, 255, 0.25)",
  borderRadius: "12px",
  boxShadow: "none",
};
```
