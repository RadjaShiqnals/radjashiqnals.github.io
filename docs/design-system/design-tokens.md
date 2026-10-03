# RadjaOS Design System (RODS) - Design Tokens Specification

The RadjaOS Design System (RODS) establishes the foundational token architecture for the RadjaOS web desktop environment. This document defines the formal variables, color coordinates, elevation layers, corner radii, and motion curves powering the modern glassmorphic desktop interface.

---

## 1. Token Taxonomy and Architecture

RODS employs a three-tier design token hierarchy:

1. **Global Tokens (Primitives)**: Raw color, spacing, and timing values expressed in absolute hex, rgba, and millisecond measurements.
2. **Semantic Tokens (System Intent)**: Tokens mapped to contextual roles such as surfaces, interactive states, text contrast levels, and structural borders.
3. **Component Tokens (Local Scopes)**: Component-specific bindings that map semantic tokens directly to UI elements (e.g., `--rods-window-header-height`, `--rods-taskbar-running-pill-width`).

### Naming Syntax

All CSS custom properties follow the formal naming convention:

```text
--rods-{tier?}-{category}-{element}-{variant}-{state}
```

- `tier`: Optional prefix if isolating raw primitives (`primitive-`) from semantic tokens. Default is semantic.
- `category`: `color`, `elevation`, `radius`, `motion`, `spacing`, `typography`.
- `element`: Target UI structure (`neutral`, `accent`, `window`, `taskbar`, `card`, `flyout`).
- `variant`: Role or level (`bg-1`, `stroke`, `primary`, `shadow-active`).
- `state`: Optional interactive state (`hover`, `pressed`, `focused`, `disabled`, `rest`).

---

## 2. Palette Specification: Obsidian Dark Neutrals

The RadjaOS dark palette is built upon deep obsidian tones designed to provide extreme contrast for translucent glass shaders and vibrant cyan-blue accents.

### Surface and Canvas Neutrals

| Token Name | Hex Value | RGBA Recipe | Usage / Surface Mapping |
| :--- | :--- | :--- | :--- |
| `--rods-color-neutral-bg-1` | `#202020` | `rgba(32, 32, 32, 0.85)` | Primary Window Body Canvas (Frosted Glass base) |
| `--rods-color-neutral-bg-2` | `#1c1c1c` | `rgba(28, 28, 28, 0.78)` | Persistent Taskbar & Navigation base |
| `--rods-color-neutral-bg-3` | `#2d2d2d` | `rgba(45, 45, 45, 0.85)` | Start Menu & Context Flyout base (Deep Acrylic) |
| `--rods-color-neutral-bg-4` | `#121212` | `rgba(18, 18, 18, 0.95)` | Desktop Base Canvas & Modal Backdrop tint |
| `--rods-color-neutral-bg-solid` | `#1a1a1a` | `rgba(26, 26, 26, 1.00)` | Eco / Potato Mode opaque fallback background |

### Card and Element Surfaces

| Token Name | RGBA Recipe | Usage |
| :--- | :--- | :--- |
| `--rods-color-card-rest` | `rgba(255, 255, 255, 0.04)` | Content Card resting state |
| `--rods-color-card-hover` | `rgba(255, 255, 255, 0.08)` | Content Card pointer hover state |
| `--rods-color-card-active` | `rgba(255, 255, 255, 0.06)` | Content Card pressed state |
| `--rods-color-card-selected` | `rgba(0, 120, 212, 0.20)` | Selected card / item highlight fill |

### Stroke and Lighting Borders

| Token Name | RGBA Recipe | Usage |
| :--- | :--- | :--- |
| `--rods-color-stroke-card` | `rgba(255, 255, 255, 0.08)` | Standard card boundary border |
| `--rods-color-stroke-card-hover` | `rgba(255, 255, 255, 0.14)` | Card border under cursor focus |
| `--rods-color-stroke-window` | `rgba(255, 255, 255, 0.08)` | Inactive window perimeter border |
| `--rods-color-stroke-window-active` | `rgba(255, 255, 255, 0.14)` | Focused window perimeter border |
| `--rods-color-stroke-window-top` | `rgba(255, 255, 255, 0.22)` | Window top-edge specular lighting highlight |
| `--rods-color-stroke-flyout` | `rgba(255, 255, 255, 0.12)` | Flyout, Start Menu, and context menu border |
| `--rods-color-stroke-subtle` | `rgba(255, 255, 255, 0.05)` | Internal dividers and table cell lines |

### Interactive Window Controls

| Token Name | Hex Value | RGBA Recipe | Usage |
| :--- | :--- | :--- | :--- |
| `--rods-color-caption-hover` | `#ffffff` | `rgba(255, 255, 255, 0.10)` | Minimize/Maximize titlebar button hover |
| `--rods-color-caption-active` | `#ffffff` | `rgba(255, 255, 255, 0.06)` | Minimize/Maximize titlebar button pressed |
| `--rods-color-close-hover` | `#c42b1c` | `rgba(196, 43, 28, 1.00)` | Window Close caption button hover |
| `--rods-color-close-active` | `#b22617` | `rgba(178, 38, 23, 1.00)` | Window Close caption button pressed |
| `--rods-color-close-icon-hover` | `#ffffff` | `rgba(255, 255, 255, 1.00)` | Close button icon glyph color on hover |

### Foreground and Typography Neutrals

| Token Name | Hex Value | RGBA Recipe | Usage |
| :--- | :--- | :--- | :--- |
| `--rods-color-text-primary` | `#f3f4f6` | `rgba(243, 244, 246, 1.00)` | Primary window text, titlebars, active labels |
| `--rods-color-text-secondary` | `#94a3b8` | `rgba(148, 163, 184, 1.00)` | Subtitles, metadata, captions, inactive labels |
| `--rods-color-text-tertiary` | `#64748b` | `rgba(100, 116, 139, 1.00)` | Disabled fields, placeholder indicators |
| `--rods-color-text-on-accent` | `#ffffff` | `rgba(255, 255, 255, 1.00)` | High-contrast text on solid brand accent |

---

## 3. Brand Accent Tokens: Radiant Blue

The brand accent palette provides optical feedback for active running instances, focus rings, interactive toggles, and system selection highlights.

| Token Name | Hex Value | RGBA Recipe | Functional Application |
| :--- | :--- | :--- | :--- |
| `--rods-color-accent-primary` | `#0078d4` | `rgba(0, 120, 212, 1.00)` | Primary brand action, default buttons, focus ring |
| `--rods-color-accent-light` | `#60cdff` | `rgba(96, 205, 255, 1.00)` | Taskbar running indicator pill, high-contrast glow |
| `--rods-color-accent-hover` | `#1084d8` | `rgba(16, 132, 216, 1.00)` | Primary button cursor hover |
| `--rods-color-accent-pressed` | `#0067b8` | `rgba(0, 103, 184, 1.00)` | Primary button active click |
| `--rods-color-accent-bg-subtle` | - | `rgba(0, 120, 212, 0.20)` | Selected item background pill |
| `--rods-color-accent-stroke-subtle` | - | `rgba(0, 120, 212, 0.50)` | Selected item outer border |
| `--rods-color-accent-glow` | - | `rgba(96, 205, 255, 0.35)` | Halo lighting for active focus rings |

---

## 4. Elevation, Layering, and Shadow Scale

RadjaOS coordinates window z-index layering and spatial elevation via strict coordinate tiers and multi-stop ambient lighting shadows.

### Stacking Hierarchy (Z-Index Scale)

```text
Layer Level                          Z-Index Value
--------------------------------------------------
Desktop Canvas & Wallpaper           0
Desktop Grid Icons                   10
Window Stack (Inactive Windows)      100 - 899 (dynamically sequenced)
Active / Focused Window              1000
Window Snap Layout Assist Overlay    1100
Persistent Taskbar                   2000
Flyout Containers (Start, Action)    3000
Context Menus (Desktop / In-App)     4000
Modal Dialogs & System Alerts        5000
Tooltips, Badges, Drag Ghost Previews 6000
```

### Shadow Scale Specifications

Shadows use a dual-layer strategy: an ambient occlusion spread for natural contact depth combined with a directional key light cast.

```css
/* Subtle Controls & Buttons */
--rods-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.25), 0 0 1px rgba(255, 255, 255, 0.05);

/* Resting Cards & Panels */
--rods-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35), 0 0 1px rgba(255, 255, 255, 0.08);

/* Inactive Floating Window Surface */
--rods-shadow-window-inactive: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.08);

/* Active / Focused Floating Window Surface */
--rods-shadow-window-active: 0 18px 45px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.14);

/* Flyout Panels (Start Menu, Quick Settings, Calendar) */
--rods-shadow-flyout: 0 20px 50px rgba(0, 0, 0, 0.60), 0 0 1px rgba(255, 255, 255, 0.18);

/* Context Menus & Popovers */
--rods-shadow-context-menu: 0 16px 40px rgba(0, 0, 0, 0.50), 0 0 1px rgba(255, 255, 255, 0.12);

/* Modal Dialogs */
--rods-shadow-modal: 0 24px 60px rgba(0, 0, 0, 0.70), 0 0 1px rgba(255, 255, 255, 0.20);
```

---

## 5. Corner Radius Scale

All radius values adhere to an 8px grid baseline with deliberate mathematical reductions for inner elements to preserve optical concentricity.

| Token Name | Value | Geometric Target |
| :--- | :--- | :--- |
| `--rods-radius-none` | `0px` | Maximized window frames (docked edge-to-edge) |
| `--rods-radius-xs` | `2px` | Taskbar running indicator pill, status markers |
| `--rods-radius-sm` | `4px` | Sub-menu items, list items, scrollbar thumb |
| `--rods-radius-md` | `6px` | Interactive controls, inputs, desktop icon bounding boxes |
| `--rods-radius-lg` | `8px` | Floating window chrome outer boundary, app content cards |
| `--rods-radius-xl` | `12px` | Context menus, quick settings cards, dialog containers |
| `--rods-radius-2xl` | `16px` | Start menu outer shell, notification banners |
| `--rods-radius-full` | `9999px` | Circular profile avatars, status pills, badge counters |

---

## 6. Motion Curves and Animation Timings

RODS UI animations are tuned for rapid desktop responsiveness, avoiding sluggish ease-in-out physics in favor of assertive cubic-bezier deceleration.

### Timing Tokens

```css
--rods-duration-instant: 100ms;  /* Micro-interactions, hover highlights, color transitions */
--rods-duration-fast:    150ms;  /* Window minimize, context menu open, button click */
--rods-duration-normal:  250ms;  /* Window restore/maximize, flyout slide */
--rods-duration-slow:    350ms;  /* Desktop mode transition, full wallpaper shift */
```

### Easing Curve Tokens

```css
/* Standard Entrance (Decelerate curve for sliding flyouts and modal entrances) */
--rods-curve-entrance: cubic-bezier(0.1, 0.9, 0.2, 1.0);

/* Standard Exit (Accelerate curve for collapsing menus and window minimize) */
--rods-curve-exit: cubic-bezier(0.7, 0.0, 1.0, 0.5);

/* Fluid Morph (Symmetric curve for window resize, tab switching) */
--rods-curve-fluid: cubic-bezier(0.4, 0.0, 0.2, 1.0);

/* Snappy Response (Direct pointer-release return) */
--rods-curve-snappy: cubic-bezier(0.0, 0.0, 0.2, 1.0);
```

---

## 7. Master CSS Variable Definition Block

The complete, production-ready CSS variable token sheet for integration into application root styling:

```css
:root {
  /* Surface Neutrals */
  --rods-color-neutral-bg-1: #202020;
  --rods-color-neutral-bg-1-translucent: rgba(32, 32, 32, 0.85);
  --rods-color-neutral-bg-2: #1c1c1c;
  --rods-color-neutral-bg-2-translucent: rgba(28, 28, 28, 0.78);
  --rods-color-neutral-bg-3: #2d2d2d;
  --rods-color-neutral-bg-3-translucent: rgba(45, 45, 45, 0.85);
  --rods-color-neutral-bg-4: #121212;
  --rods-color-neutral-bg-4-translucent: rgba(18, 18, 18, 0.95);
  --rods-color-neutral-bg-solid: #1a1a1a;

  /* Card and Content Surfaces */
  --rods-color-card-rest: rgba(255, 255, 255, 0.04);
  --rods-color-card-hover: rgba(255, 255, 255, 0.08);
  --rods-color-card-active: rgba(255, 255, 255, 0.06);
  --rods-color-card-selected: rgba(0, 120, 212, 0.20);

  /* Strokes and Outlines */
  --rods-color-stroke-card: rgba(255, 255, 255, 0.08);
  --rods-color-stroke-card-hover: rgba(255, 255, 255, 0.14);
  --rods-color-stroke-window: rgba(255, 255, 255, 0.08);
  --rods-color-stroke-window-active: rgba(255, 255, 255, 0.14);
  --rods-color-stroke-window-top: rgba(255, 255, 255, 0.22);
  --rods-color-stroke-flyout: rgba(255, 255, 255, 0.12);
  --rods-color-stroke-subtle: rgba(255, 255, 255, 0.05);

  /* Window Caption Controls */
  --rods-color-caption-hover: rgba(255, 255, 255, 0.10);
  --rods-color-caption-active: rgba(255, 255, 255, 0.06);
  --rods-color-close-hover: #c42b1c;
  --rods-color-close-active: #b22617;
  --rods-color-close-icon-hover: #ffffff;

  /* Typography Neutrals */
  --rods-color-text-primary: #f3f4f6;
  --rods-color-text-secondary: #94a3b8;
  --rods-color-text-tertiary: #64748b;
  --rods-color-text-disabled: #475569;
  --rods-color-text-on-accent: #ffffff;

  /* Brand Accents */
  --rods-color-accent-primary: #0078d4;
  --rods-color-accent-light: #60cdff;
  --rods-color-accent-hover: #1084d8;
  --rods-color-accent-pressed: #0067b8;
  --rods-color-accent-bg-subtle: rgba(0, 120, 212, 0.20);
  --rods-color-accent-stroke-subtle: rgba(0, 120, 212, 0.50);
  --rods-color-accent-glow: rgba(96, 205, 255, 0.35);

  /* Elevation Z-Index */
  --rods-z-canvas: 0;
  --rods-z-desktop-icons: 10;
  --rods-z-window-inactive: 100;
  --rods-z-window-active: 1000;
  --rods-z-snap-layout: 1100;
  --rods-z-taskbar: 2000;
  --rods-z-flyout: 3000;
  --rods-z-context-menu: 4000;
  --rods-z-modal: 5000;
  --rods-z-tooltip: 6000;

  /* Shadows */
  --rods-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.25), 0 0 1px rgba(255, 255, 255, 0.05);
  --rods-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35), 0 0 1px rgba(255, 255, 255, 0.08);
  --rods-shadow-window-inactive: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.08);
  --rods-shadow-window-active: 0 18px 45px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.14);
  --rods-shadow-flyout: 0 20px 50px rgba(0, 0, 0, 0.60), 0 0 1px rgba(255, 255, 255, 0.18);
  --rods-shadow-context-menu: 0 16px 40px rgba(0, 0, 0, 0.50), 0 0 1px rgba(255, 255, 255, 0.12);
  --rods-shadow-modal: 0 24px 60px rgba(0, 0, 0, 0.70), 0 0 1px rgba(255, 255, 255, 0.20);

  /* Radii */
  --rods-radius-none: 0px;
  --rods-radius-xs: 2px;
  --rods-radius-sm: 4px;
  --rods-radius-md: 6px;
  --rods-radius-lg: 8px;
  --rods-radius-xl: 12px;
  --rods-radius-2xl: 16px;
  --rods-radius-full: 9999px;

  /* Motion */
  --rods-duration-instant: 100ms;
  --rods-duration-fast: 150ms;
  --rods-duration-normal: 250ms;
  --rods-duration-slow: 350ms;
  --rods-curve-entrance: cubic-bezier(0.1, 0.9, 0.2, 1.0);
  --rods-curve-exit: cubic-bezier(0.7, 0.0, 1.0, 0.5);
  --rods-curve-fluid: cubic-bezier(0.4, 0.0, 0.2, 1.0);
  --rods-curve-snappy: cubic-bezier(0.0, 0.0, 0.2, 1.0);
}
```
