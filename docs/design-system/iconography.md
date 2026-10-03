# RadjaOS Design System (RODS) - Iconography and Visual Asset Specification

The RadjaOS Design System (RODS) implements a bifurcated visual asset architecture that pairs lightweight, monochromatic vector glyphs for system controls with richly rendered 3D dimensional assets for application launching. This document specifies the bounding box standards, asset repository structure, dual-mode execution rules, fallback rendering pipelines, and accessibility compliance.

---

## 1. Icon Dimensions and Standard Bounding Box Grid

To guarantee optical consistency across varying display scales and densities, all icons align to a standardized pixel-grid matrix:

```text
Grid Tier      Bounding Box    Live Content Area    Padding Margin    Target Stroke
-----------------------------------------------------------------------------------
Micro          16px x 16px     14px x 14px          1px perimeter     1.25px - 1.5px
Compact        20px x 20px     18px x 18px          1px perimeter     1.50px
Standard       24px x 24px     20px x 20px          2px perimeter     1.50px - 1.75px
Medium Tile    32px x 32px     28px x 28px          2px perimeter     Rendered 3D Asset
Desktop Large  48px x 48px     44px x 44px          2px perimeter     Rendered 3D Asset
```

### Grid Geometry and Alignment Rules

1. **Optical Centering vs Geometric Centering**:
   Asymmetrical glyphs (such as play arrows, chevrons, and magnifying glasses) must be optically centered based on visual mass rather than bounding box center.
2. **Pixel Snapping**:
   Vector path anchor points must align to integers on the pixel grid. Sub-pixel rendering of critical structural lines is prohibited to avoid antialiasing blur on standard-DPI monitors.
3. **Keyline Shapes (24px Standard Grid)**:
   - Square: 16px x 16px with 2px corner radius.
   - Circle: 18px diameter.
   - Horizontal Rectangle: 18px wide x 14px high.
   - Vertical Rectangle: 14px wide x 18px high.

---

## 2. Asset Directory Structure under `public/image/`

All iconography and graphic media reside under the `public/image/` directory, structured by functional domain:

```text
public/image/
|-- win11/                      # Legacy internal asset path for 3D dimensional desktop icons
|   |-- thispc.png              # System File Manager / Computer launcher
|   |-- explorer.png            # File Explorer browser launcher
|   |-- terminal.png            # System Command Terminal emulator
|   |-- vscode.png              # Code Studio application launcher
|   |-- settings.png            # System Configuration & Preferences
|   |-- taskmanager.png         # Activity Monitor & Process Manager
|   |-- bin0.png                # Desktop Recycle Bin (empty state)
|   |-- bin1.png                # Desktop Recycle Bin (full state)
|   |-- search.png              # Global Search launcher glyph
|   |-- widget.png              # News & Widgets flyout launcher
|   |-- taskview.png            # Virtual Workspace Switcher
|   `-- home.png                # User Profile / Personal storage shortcut
|-- wallpaper/                  # High-resolution desktop canvas backdrops
|   |-- bloom-dark.jpg          # Default dark bloom wallpaper
|   `-- landscape.jpg           # Alternative panoramic landscape wallpaper
|-- projects/                   # Showcase portfolio screenshots and media
`-- glyphs/                     # Scalable Vector Graphics (SVG) system icons
```

> Note: The directory path `public/image/win11/` is maintained as a legacy internal folder name for backwards compatibility with existing asset loaders and build scripts. Conceptually, all assets within this directory belong to the RODS 3D Dimensional Desktop Icon collection.

### Asset Inventory and Specifications

| Asset Path | Rendered Size | Asset Resolution | Bit Depth | Color Profile | Usage Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/image/win11/thispc.png` | 48px / 32px | 128px x 128px | 32-bit PNG | sRGB | Desktop shortcut, File Manager |
| `public/image/win11/explorer.png`| 48px / 32px | 128px x 128px | 32-bit PNG | sRGB | Desktop shortcut, Taskbar pin |
| `public/image/win11/terminal.png`| 48px / 32px | 128px x 128px | 32-bit PNG | sRGB | Desktop shortcut, Developer tools |
| `public/image/win11/vscode.png` | 48px / 32px | 128px x 128px | 32-bit PNG | sRGB | Desktop shortcut, Code editor |
| `public/image/win11/settings.png`| 48px / 32px | 128px x 128px | 32-bit PNG | sRGB | Start menu pin, System settings |
| `public/image/win11/taskmanager.png`| 48px / 32px| 128px x 128px | 32-bit PNG | sRGB | Activity monitor launcher |
| `public/image/win11/bin0.png` | 48px | 128px x 128px | 32-bit PNG | sRGB | Desktop Trash (empty state) |
| `public/image/win11/bin1.png` | 48px | 128px x 128px | 32-bit PNG | sRGB | Desktop Trash (populated state) |

---

## 3. Dual-Mode Icon Strategy: Vector Glyphs vs Rendered 3D Assets

RODS enforces a clear functional boundary between monochromatic vector glyphs and multi-layered 3D dimensional assets.

### Category A: Monochromatic Vector Glyphs (SVG)

Vector glyphs handle operational system chrome and contextual controls.

- **Application Domains**:
  - Window caption controls: Minimize (`-`), Maximize (`[ ]`), Restore (`[=]`), Close (`X`).
  - System tray indicators: Network status, volume slider, battery gauge, language pill.
  - Context menu items: Cut, Copy, Paste, Rename, Delete, Properties.
  - Form controls: Dropdown chevrons, search icons, clear buttons, checkmarks.
- **Styling Rules**:
  - Inherits foreground color dynamically via `currentColor`.
  - Standardized stroke width: 1.5px (with rounded stroke-linecap and stroke-linejoin).
  - Hover feedback: Container background changes; glyph color transitions subtly to high-contrast white (`#ffffff`).

```html
<!-- Example: Standard Window Minimize Caption Glyph -->
<svg class="rods-caption-icon" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
  <path d="M1 5H9" />
</svg>
```

### Category B: Rendered 3D Dimensional Desktop Assets (PNG / WebP)

3D dimensional assets provide tactile object recognition for primary application launch points.

- **Application Domains**:
  - Desktop canvas shortcuts.
  - Persistent taskbar application launcher icons.
  - Start Menu pinned application tiles.
- **Visual Anatomy**:
  - Frontal-isometric perspective with subtle upward angle (10 to 15 degrees).
  - Multi-stop color gradients with high saturation.
  - Top-down directional key lighting simulating 45-degree ambient desktop light.
  - Soft ambient floor contact shadow embedded directly in the alpha channel of the PNG asset.

### Architectural Invariant Rules

- **Rule 1 (No Flat Launchers)**: Desktop shortcuts and Taskbar pins must never use flat 1px wireframe icons. They must always use rich 3D dimensional assets.
- **Rule 2 (No 3D System Chrome)**: Window caption buttons, context menu items, and scrollbar controls must never use 3D rendered assets. They must strictly use monochromatic vector glyphs.
- **Rule 3 (Resolution Scaling)**: 3D assets must be authored at minimum 2x pixel density (128x128px or 96x96px) and downscaled via CSS to prevent pixelation on high-density displays.

---

## 4. Desktop Icon Container Specifications

Desktop canvas shortcuts require precise spacing and hit-target dimensions to support both pointer precision and visual clarity:

```css
.rods-desktop-icon-cell {
  width: 76px;
  height: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 6px 4px;
  border-radius: var(--rods-radius-md, 6px);
  border: 1px solid transparent;
  background-color: transparent;
  transition: background-color var(--rods-duration-instant) ease, border-color var(--rods-duration-instant) ease;
  cursor: default;
  user-select: none;
}

.rods-desktop-icon-cell:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.rods-desktop-icon-cell.is-selected {
  background-color: rgba(0, 120, 212, 0.22);
  border-color: rgba(0, 120, 212, 0.45);
}

.rods-desktop-icon-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
}
```

---

## 5. Fallback Rendering Pipeline and Performance

To prevent visual layout shifts (CLS) and broken image icons when network latency occurs or an image asset fails to resolve:

### Progressive Decoding Configuration

```html
<img
  src="/image/win11/terminal.png"
  alt=""
  aria-hidden="true"
  width="48"
  height="48"
  loading="eager"
  decoding="async"
  class="rods-desktop-icon-image"
  onerror="this.classList.add('is-fallback'); this.src='/image/glyphs/app-fallback.svg';"
/>
```

### Vector Fallback Generator

When a 3D asset fails to load, the system falls back to a generic procedural application tile:

```css
.rods-icon-fallback-badge {
  width: 48px;
  height: 48px;
  border-radius: var(--rods-radius-md);
  background: linear-gradient(135deg, #0078d4, #004e8c);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: var(--rods-font-family-ui);
  font-weight: 600;
  font-size: 20px;
  border: 1px solid rgba(255, 255, 255, 0.20);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.30);
}
```

---

## 6. Semantic Accessibility and ARIA Compliance

All iconography in RadjaOS must strictly adhere to the following accessibility rules:

### Decorative vs Informative Icon Matrix

1. **Decorative Icons with Accompanying Text**:
   - When an icon is rendered alongside a visible textual label (such as a desktop shortcut label or context menu action), the icon is considered purely decorative.
   - Requirement: Must declare `aria-hidden="true"`.
   ```html
   <div class="rods-desktop-icon-cell" role="button" tabindex="0">
     <img src="/image/win11/terminal.png" alt="" aria-hidden="true" class="rods-desktop-icon-image" />
     <span class="rods-desktop-icon-label">Terminal</span>
   </div>
   ```

2. **Standalone Interactive Icon Buttons**:
   - When an icon serves as an interactive button without visible text (such as Window Caption buttons or Taskbar Quick Settings indicators), the element MUST declare an explicit accessibility label.
   - Requirement: Must declare `aria-label="<Action Name>"` and `role="button"`.
   ```html
   <button type="button" class="rods-caption-btn rods-btn-close" aria-label="Close Window">
     <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10">
       <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
     </svg>
   </button>
   ```

3. **Stateful Dynamic Status Icons**:
   - System tray indicators that communicate live hardware states (e.g. battery level or network connectivity) must update their `aria-label` dynamically based on state changes.
   ```html
   <div class="rods-tray-item" role="status" aria-label="Network: Connected to SIDIGS-5G (Internet access)">
     <svg aria-hidden="true" width="16" height="16">...</svg>
   </div>
   ```
