# RadjaOS Design System (RODS) - Materials and Surfaces Specification

The RadjaOS Design System (RODS) utilizes an advanced optical compositing architecture to render depth, material texture, and light interaction across the web desktop environment. This document outlines the physical principles, CSS shader implementations, edge lighting behaviors, and performance mitigation strategies governing desktop surfaces.

---

## 1. Optical Compositing Model

Surfaces within RadjaOS do not exist as flat colored rectangles. Instead, they are constructed as multi-pass optical sandwiches that simulate light transmission, subsurface scattering, specular edge reflections, and ambient occlusion.

### The Five-Layer Surface Stack

```text
[5] Specular Edge Stroke     (1px directional gradient / top-edge light)
[4] Luminance Noise Grain    (Subtle high-frequency dither to eliminate color banding)
[3] Color Tint Matrix        (Absorptive neutral obsidian pigment with alpha channel)
[2] Backdrop Blur Filter     (Dual-pass Gaussian blur kernel with saturation boost)
[1] Underlying Canvas        (Desktop wallpaper, background windows, canvas icons)
```

Surfaces are categorized into two primary material archetypes based on their spatial persistence:
- **Frosted Glass Surface**: High-structural persistence, moderate blur, calibrated for long-session readability and low visual fatigue (Window Chrome, Persistent Taskbar).
- **Deep Acrylic Surface**: High-diffusion transient material, elevated saturation, calibrated for contextual focus and distinct spatial separation (Start Menu, Quick Settings, Context Menus).

---

## 2. Frosted Glass Surface (Persistent Layer)

The Frosted Glass Surface is the visual foundation of persistent OS chrome. It delivers a grounded, physical feel while sampling the colors of the desktop wallpaper underneath.

### Optical Characteristics

- **Base Tint**: `rgba(30, 30, 30, 0.82)`
- **Backdrop Blur Radius**: `30px`
- **Saturation Multiplier**: `130%` (compensates for contrast wash-out caused by Gaussian scattering)
- **Edge Illumination**: 1px perimeter stroke with top-edge specular bias
- **Shadow Footprint**: Dual-stop ambient plus directional drop shadow

### CSS Implementation

```css
.rods-surface-frosted-glass {
  background-color: rgba(30, 30, 30, 0.82);
  backdrop-filter: blur(30px) saturate(130%);
  -webkit-backdrop-filter: blur(30px) saturate(130%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.16);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.50),
    0 0 1px rgba(255, 255, 255, 0.10);
}
```

### Active vs Inactive State Variance

To ensure immediate cognitive recognition of window focus, the Frosted Glass Surface modulates border opacity and shadow dispersion dynamically:

#### Active (Focused Window)
```css
.rods-window.is-active {
  background-color: rgba(32, 32, 32, 0.86);
  border-color: rgba(255, 255, 255, 0.14);
  border-top-color: rgba(255, 255, 255, 0.24);
  box-shadow:
    0 22px 55px rgba(0, 0, 0, 0.60),
    0 0 1px rgba(255, 255, 255, 0.16);
}
```

#### Inactive (Background Window)
```css
.rods-window:not(.is-active) {
  background-color: rgba(26, 26, 26, 0.78);
  border-color: rgba(255, 255, 255, 0.05);
  border-top-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.35),
    0 0 1px rgba(255, 255, 255, 0.05);
}
```

---

## 3. Deep Acrylic Surface (Transient Contextual Layer)

Deep Acrylic is reserved for temporary, high-attention UI surfaces that appear above the window plane, such as the Start Menu, Quick Settings, Action Center flyouts, and desktop right-click context menus.

### Optical Characteristics

- **Base Tint**: `rgba(36, 36, 36, 0.82)`
- **Backdrop Blur Radius**: `40px`
- **Saturation Multiplier**: `150%`
- **Edge Illumination**: High-contrast perimeter stroke (`rgba(255, 255, 255, 0.12)`)
- **Shadow Footprint**: High-elevation ambient diffusion for floating separation

### CSS Implementation

```css
.rods-surface-deep-acrylic {
  position: relative;
  background-color: rgba(36, 36, 36, 0.82);
  backdrop-filter: blur(40px) saturate(150%);
  -webkit-backdrop-filter: blur(40px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(255, 255, 255, 0.20);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.60),
    0 0 1px rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

/* Optional Noise Grain Pseudo-Element for Texture Simulation */
.rods-surface-deep-acrylic::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.025;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  z-index: 0;
}
```

### Context Menu Specialization

Context menus require rapid rendering and sharp typography contrast at smaller scales:

```css
.rods-context-menu {
  background-color: rgba(32, 32, 32, 0.92);
  backdrop-filter: blur(32px) saturate(140%);
  -webkit-backdrop-filter: blur(32px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: var(--rods-radius-md);
  padding: 4px;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.50),
    0 0 1px rgba(255, 255, 255, 0.12);
}
```

---

## 4. Eco / Potato Mode Performance Fallback

High-radius `backdrop-filter` passes impose measurable fill-rate burdens on low-end hardware, integrated graphics processors, and mobile web viewports. RadjaOS includes a dedicated **Eco Mode** engine (colloquially termed Potato Mode) to guarantee 60 FPS fluidity regardless of client hardware.

### Trigger Matrix

Eco Mode is triggered when any of the following conditions evaluate to true:

1. User toggles `Eco Mode` explicitly in System Settings.
2. System detects low battery status via `navigator.getBattery()`.
3. Client hardware reports fewer than 4 logical cores (`navigator.hardwareConcurrency < 4`).
4. Real-time frame loop monitors drop below 45 FPS over a sustained 3-second window.

### Shader Disablement and Opaque Fallback

When Eco Mode is active, all backdrop-filter calculations are removed from the GPU pipeline:

```css
/* Global Eco Mode Class Applied to Root HTML / Body */
html.rods-eco-mode .rods-surface-frosted-glass,
html.rods-eco-mode .rods-surface-deep-acrylic,
html.rods-eco-mode .rods-window,
html.rods-eco-mode .rods-taskbar,
html.rods-eco-mode .rods-flyout {
  /* Complete bypass of GPU fragment shaders */
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;

  /* Solid opaque obsidian tone */
  background-color: var(--rods-color-neutral-bg-solid, #1a1a1a) !important;

  /* Crisp single-line opaque boundary */
  border: 1px solid rgba(255, 255, 255, 0.15) !important;

  /* Low-overhead single-pass shadow */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.80) !important;
}
```

### Wireframe Outline Dragging

In standard mode, floating windows render live content while being dragged across the screen. On budget hardware, calculating live layout reflows and real-time backdrop blur during pointer move operations causes composite-thread micro-stutter.

Eco Mode activates **Wireframe Outline Dragging**:

```text
Drag Sequence:
1. Pointer Down on Titlebar -> Capture origin (x, y) and window bounds.
2. Pointer Move (Delta > 3px) -> Render lightweight wireframe ghost outline (1px border).
                                Freeze / Hide real-time DOM updates in window body.
3. Pointer Move Continuation -> Transform wireframe outline using hardware translate3d.
4. Pointer Up (Release)      -> Commit final bounds to window element. Remove wireframe.
                                Repaint window contents once in resting state.
```

#### Wireframe Ghost CSS Implementation

```css
.rods-drag-wireframe-ghost {
  position: absolute;
  pointer-events: none;
  z-index: var(--rods-z-tooltip);
  border: 1.5px dashed var(--rods-color-accent-light, #60cdff);
  background-color: rgba(0, 120, 212, 0.08);
  border-radius: var(--rods-radius-lg);
  box-shadow: 0 0 12px rgba(96, 205, 255, 0.25);
  will-change: transform;
}
```

---

## 5. GPU Profiling, Compositing Layers, and Best Practices

To maintain optimal compositor performance across all desktop surfaces:

1. **Layer Promotion Management**:
   Only promote active windows or animating flyouts to separate compositor layers using `will-change: transform`. Avoid applying `will-change` globally to idle background windows to prevent VRAM exhaustion.

2. **CSS Containment**:
   Apply `contain: layout paint;` to window interior content containers. This isolates mutations within an application (such as terminal scrolling or code editor updates) from causing desktop-wide repaints.

3. **Subpixel Antialiasing and Blur Boundary Bleed**:
   Ensure `overflow: hidden;` is applied to containers with rounded corners and `backdrop-filter` to prevent translucent bleeding past the radius boundary in WebKit and Chromium engines.
