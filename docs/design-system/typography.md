# RadjaOS Design System (RODS) - Typography Specification

The RadjaOS Design System (RODS) typography framework establishes clarity, optical legibility, and geometric balance across diverse screen resolutions and translucent desktop surfaces. This document details the font family fallback hierarchy, modular typographic scale, font weight distribution, rendering parameters, and high-contrast accessibility standards.

---

## 1. Font Family Stack Architecture

RODS employs a multi-tiered font family fallback strategy that prioritizes local native variable fonts, falling back gracefully to neutral geometric web fonts and system fallbacks.

### Primary User Interface Stack

```css
--rods-font-family-ui: 'Segoe UI Variable', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

#### Optical Sizing via Segoe UI Variable
When `Segoe UI Variable` is available locally, the browser automatically engages the optical size axis (`opsz`), adjusting letter geometry for optimal reading across scales:
- **Small (`opsz 8-12`)**: Tailored for captions, system tray indicators, and fine metadata with wider counters and heavier stroke weights.
- **Text (`opsz 13-17`)**: Optimized for general body copy, input controls, and contextual menus.
- **Display (`opsz 18-36`)**: Scaled for window titlebars, flyout headers, and showcase hero titles with tighter spacing and delicate contrast.

#### Cross-Platform Neutrality via Inter
For systems lacking Segoe UI Variable, `Inter` serves as the primary standardized web font, providing near-identical x-height, open counter shapes, and robust tabular numeric features.

### Terminal and Monospace Stack

```css
--rods-font-family-mono: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace;
```

Reserved for the RadjaOS Terminal emulator, Developer Tools, and code viewer components. Features:
- Slashed zero (`0`) distinction.
- Consistent character pitch for aligned tabular data and ANSI command rendering.
- Programming ligature support where enabled.

---

## 2. Modular Type Scale

The RODS typographic scale is calibrated for 13px desktop baseline typography, ensuring information density while preserving comfortable whitespace.

| Token Name | Size (px) | Size (rem) | Line Height | Letter Spacing | Weight | Primary Functional Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `--rods-type-display` | `24px - 28px` | `1.50rem - 1.75rem` | `1.2 (32px)` | `-0.02em` | `600 (Semibold)` | Showcase Hero titles, major welcome banners |
| `--rods-type-title` | `18px - 20px` | `1.125rem - 1.25rem` | `1.3 (26px)` | `-0.015em` | `600 (Semibold)` | Window titlebars, top-level settings headers |
| `--rods-type-subtitle` | `14px - 15px` | `0.875rem - 0.9375rem`| `1.4 (20px)` | `-0.01em` | `500 (Medium)` | Section headers, card group titles, flyout headers |
| `--rods-type-body` | `13px` | `0.8125rem` | `1.5 (19.5px)`| `0.00em` | `400 (Regular)` | Primary body text, app content, menu items |
| `--rods-type-caption` | `11px - 12px` | `0.6875rem - 0.75rem` | `1.4 (16px)` | `+0.01em` | `400 (Regular)` | Desktop icon labels, system tray clock, metadata |
| `--rods-type-code` | `12px` | `0.75rem` | `1.6 (19.2px)`| `0.00em` | `400 / 500` | Terminal emulator text, source code snippets |

---

## 3. Font Weights and Functional Application

RODS restricts font weight variations to four distinct values to prevent visual noise:

### 400 (Regular) - Baseline Text
- Applied to all continuous narrative text, paragraph copy, and card descriptions.
- Used for default desktop icon labels and system tray date displays.
- Default text color: `--rods-color-text-primary` (`#f3f4f6`) or `--rods-color-text-secondary` (`#94a3b8`).

### 500 (Medium) - Functional Elements
- Applied to interactive controls requiring structural distinction without excessive weight.
- Used for tab headers, button text, segmented control labels, and form input labels.
- Provides crisp definition in smaller sizes (13px - 14px).

### 600 (Semibold) - Structural Anchors
- Applied to window titlebar titles, modal dialog headlines, and major section dividers.
- Anchors the visual hierarchy across dense glassmorphic surfaces.

### 700 (Bold) - Quantitative Callouts
- Reserved for prominent metrics, system notification urgency tags, and numerical dashboard counters.
- Sparingly applied to preserve high-tech aesthetic restraint.

---

## 4. Text Rendering, Smoothing, and Contrast Legibility

### Engine Smoothing Configuration

To prevent blurred text glyphs on dark obsidian backgrounds and translucent surfaces, the following root smoothing rules are mandated:

```css
html, body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}
```

### Desktop Canvas Text Legibility

Desktop icon labels reside directly above variable wallpaper images. To guarantee legible text regardless of wallpaper luminance variations, all canvas icon labels must apply an ambient text shadow:

```css
.rods-desktop-icon-label {
  font-size: var(--rods-type-caption);
  font-weight: 400;
  color: #ffffff;
  text-align: center;
  line-height: 1.3;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.85),
    0 0 4px rgba(0, 0, 0, 0.60);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}
```

### Glass Surface Contrast Standards

On translucent Frosted Glass and Deep Acrylic surfaces:
- **Primary Body Text (`#f3f4f6`)**: Yields an 11.2:1 contrast ratio against the obsidian base (`#202020`), substantially exceeding WCAG AAA standards (7:1).
- **Secondary Metadata Text (`#94a3b8`)**: Yields a 5.8:1 contrast ratio against `#202020`, exceeding WCAG AA standards (4.5:1) for body text and AAA for large text.
- **Tertiary / Disabled Text (`#64748b`)**: Retained strictly for non-essential placeholder hints and disabled states (3.2:1 contrast ratio).

---

## 5. High-Contrast Accessibility Mode

When the user activates High Contrast Mode or the browser triggers `@media (prefers-contrast: more)`, RODS overrides translucent typography tokens with ultra-high contrast primitives:

```css
@media (prefers-contrast: more) {
  :root {
    --rods-color-text-primary: #ffffff !important;
    --rods-color-text-secondary: #e2e8f0 !important;
    --rods-color-text-tertiary: #cbd5e1 !important;
    --rods-color-accent-light: #70d4ff !important;
  }

  .rods-desktop-icon-label {
    text-shadow: none !important;
    background-color: rgba(0, 0, 0, 0.85);
    padding: 2px 4px;
    border-radius: 2px;
  }

  *:focus-visible {
    outline: 2px solid var(--rods-color-accent-light) !important;
    outline-offset: 2px !important;
  }
}
```

---

## 6. Typographic Utility Classes

Standardized helper classes for immediate integration:

```css
/* Typography Role Classes */
.rods-text-display {
  font-family: var(--rods-font-family-ui);
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--rods-color-text-primary);
}

.rods-text-title {
  font-family: var(--rods-font-family-ui);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.015em;
  color: var(--rods-color-text-primary);
}

.rods-text-subtitle {
  font-family: var(--rods-font-family-ui);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--rods-color-text-secondary);
}

.rods-text-body {
  font-family: var(--rods-font-family-ui);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--rods-color-text-primary);
}

.rods-text-caption {
  font-family: var(--rods-font-family-ui);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: +0.01em;
  color: var(--rods-color-text-secondary);
}

.rods-text-code {
  font-family: var(--rods-font-family-mono);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.6;
  color: #e2e8f0;
}
```
