# RadjaOS Image Studio Specification: Neural Segmentation, Retouch Engine, and Persistent Storage Architecture

Technical specification for the RadjaOS Image Studio application (`ImageStudioApp.tsx`), detailing the in-browser neural background removal pipeline, hybrid subject-protection algorithms, retouch canvas engine, responsive DOM tree preservation, and adaptive native browser storage management.

---

## 1. System Overview and Architectural Mission

RadjaOS Image Studio (`studio`) is a modular, high-fidelity image editing application executed entirely client-side within the browser. It combines local WebAssembly/ONNX neural networks, direct HTML5 Canvas 2D graphics pipelines, interactive crop/transform operations, and an adaptive native `localStorage` quota engine with automatic lifecycle eviction.

```
+---------------------------------------------------------------------------------------+
|                             RadjaOS Image Studio Architecture                         |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   +----------------------+     +-----------------------+     +--------------------+   |
|   | File Upload / Drag   |     | Async Clipboard API   |     | Copy-n-Paste Hook  |   |
|   +-----------+----------+     +-----------+-----------+     +---------+----------+   |
|               |                            |                           |              |
|               +--------------------+       |       +-------------------+              |
|                                    |       |       |                                  |
|                                    v       v       v                                  |
|                        +---------------------------------------+                      |
|                        |       Unified Image Ingestion Pipe    |                      |
|                        |       (Resolution & Aspect Snapping)  |                      |
|                        +-------------------+-------------------+                      |
|                                            |                                          |
|                                            v                                          |
|                        +---------------------------------------+                      |
|                        |      HTML5 2D Interactive Canvas      |                      |
|                        |      (willReadFrequently: true)       |                      |
|                        +---------+-------------------+---------+                      |
|                                  |                   |                                |
|        +-------------------------+                   +------------------------+       |
|        |                                                                      |       |
|        v                                                                      v       |
|   +-------------------------------+                      +------------------------+   |
|   | Local Neural Network Runtime  |                      | Interactive Retouch    |   |
|   | (@imgly/background-removal)   |                      | Brush & Vector Engine  |   |
|   | - ONNX Runtime Web (WASM)     |                      | - Destination-Out Cut  |   |
|   | - ISNet FP16 & INT8 Weights   |                      | - Original Detail Draw |   |
|   | - COOP/COEP Multi-Threading   |                      | - BFS Flood Magic Wand |   |
|   +---------------+---------------+                      | - Contiguous Chroma Key|   |
|                   |                                      +------------+-----------+   |
|                   v                                                   |               |
|   +-------------------------------+                                   |               |
|   | Hybrid Post-Processing Engine |                                   |               |
|   | - Luminance Envelope BFS      |                                   |               |
|   | - 3x3 Contrast Lineart Guard  |                                   |               |
|   | - Inner Hole Reclamation      |                                   |               |
|   | - Edge Antialiasing Feather   |                                   |               |
|   +---------------+---------------+                                   |               |
|                   |                                                   |               |
|                   +--------------------> [ Composite ] <--------------+               |
|                                                |                                      |
|                                                v                                      |
|                                +-------------------------------+                      |
|                                | Non-Blocking History Pipeline |                      |
|                                | - 20-Step RAM Undo Stack      |                      |
|                                | - scheduler.yield() Debounce  |                      |
|                                | - WebP Alpha Lossless Encoding|                      |
|                                +---------------+---------------+                      |
|                                                |                                      |
|                                                v                                      |
|                                +-------------------------------+                      |
|                                | Adaptive Native Browser Store |                      |
|                                | - Binary Quota Probe (~5MB)   |                      |
|                                | - Oldest-First Auto-Eviction  |                      |
|                                +-------------------------------+                      |
+---------------------------------------------------------------------------------------+
```

---

## 2. Neural Segmentation Pipeline and WebAssembly Concurrency

### 2.1. Model Architecture & Runtime
Image Studio integrates `@imgly/background-removal` executing ISNet (Interactively Segmented Network) ONNX models natively in the client:
- **ISNet FP16 (High Precision, ~44 MB)**: Provides sub-pixel boundary classification, preserving fine hair strands and anime line art.
- **ISNet INT8 (Fast, ~35 MB)**: Quantized variant for bandwidth-constrained environments.

### 2.2. WebAssembly Multi-Threading & Isolation Policies
To utilize WebAssembly multi-threading without falling back to single-threaded execution, the server infrastructure sets Cross-Origin Isolation headers in `astro.config.mjs`:

```javascript
server: {
  headers: {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "credentialless"
  }
}
```

This unlocks `SharedArrayBuffer` support across Chrome, Edge, and Firefox, enabling WebAssembly inference to parallelize across available CPU threads (e.g., `env.wasm.numThreads = 12`).

---

## 3. Hybrid Post-Processing & Subject Protection Algorithm

Standard neural models trained on upright photography frequently misclassify inverted or upside-down figures (such as character poses hanging inverted or lying down), accidentally cutting out faces, eyes, and white hair highlights. RadjaOS implements an analytical boundary-seeded post-processing pass (`applyRefinedMask`) executed on the raw probability mask:

### 3.1. Luminance Envelope & Boundary-Seeded Flood Fill
1. **Luminance Extraction**: Each pixel's relative luminance is calculated:
   ```
   Y = 0.299 * R + 0.587 * G + 0.114 * B
   ```
2. **Exterior Boundary Envelope**: The algorithm samples the perimeter pixels (top, bottom, left, and right borders) to determine the minimum and maximum luminance bounds of the true outer background:
   ```
   minBorderLum = min(Perimeter Luminance)
   maxBorderLum = max(Perimeter Luminance)
   ```
3. **Contrast Gradient Map**: A 3x3 local contrast matrix evaluates luminance gradients:
   ```
   Gradient(x, y) = max(3x3 Neighbors) - min(3x3 Neighbors)
   isEdge(x, y) = Gradient(x, y) >= 22
   ```
   High-contrast boundaries denote sketch lineart, clothing contours, and hair edges, forming an impassable barrier for flood fill.
4. **BFS Outer Background Discovery**: Breadth-First Search seeds from the perimeter and propagates inward strictly while pixel color distances stay within tolerance:
   ```
   Distance(P1, P2) = |R1 - R2| + |G1 - G2| + |B1 - B2| <= 30
   ```
5. **Subject Core Protection**: Any pixel not reachable from the exterior border fill is classified as interior subject matter and reclaimed (`mask[i] = 255`), preventing inverted faces or white clothing from being hollowed out.

### 3.2. Inner Hole Reclamation
Enclosed transparent regions completely surrounded by opaque foreground (e.g., pupils, teeth, inner shirt collars) are discovered via inverted BFS flood-fill and restored to solid alpha.

### 3.3. Antialiased Edge Feathering
Transition boundaries between mask value `0` and `255` receive a weighted 3x3 neighbor average to smooth pixel stepping without blur distortion.

---

## 4. Retouch Canvas & Vector Brush Engine

Image Studio provides real-time, non-destructive retouching modes:

### 4.1. Magic Wand (BFS Flood Fill)
- **Contiguous Mode**: 4-way BFS flood-fill seeded from click coordinates, erasing connected pixels whose Euclidean color distance from the target pixel is less than or equal to `wandTolerance`.
- **Global Mode**: Sweeps all canvas pixels matching the target color within tolerance.

### 4.2. Erase Brush
Uses HTML5 Canvas 2D `globalCompositeOperation = "destination-out"` with a soft radial falloff gradient (`createRadialGradient`) to cut away unwanted remnants.

### 4.3. Restore Detail Brush
Paints original pixel data back onto the target canvas from `originalImageRef.current` using `globalCompositeOperation = "source-over"` with circular path clipping (`ctx.clip()`), allowing surgical recovery of hair or clothing boundaries.

### 4.4. Contiguous Border Chroma Key
Samples the four extreme canvas corners to construct reference background chromatic targets, executing an outer perimeter BFS flood-fill to strip uniform backgrounds instantly without downloading AI models.

---

## 5. Responsive DOM Tree Preservation Across Layout Shifts

### 5.1. The Root Fiber Destruction Problem
In previous architectures, switching between Mobile Sheet mode (`< 768px`) and Desktop Floating Window mode (`>= 768px`) in `WindowFrame.tsx` swapped the outer container between `<div>` and `<React.Fragment>`. This root fiber type transition caused React to destroy the component tree, unmounting `ImageStudioApp` and resetting state to the initial default sample image.

### 5.2. Unified DOM Architecture Solution
`WindowFrame.tsx` now maintains an invariant outer JSX tree regardless of viewport dimensions:
```tsx
<div
  ref={windowRef}
  style={{
    display: isMinimized ? "none" : undefined,
    zIndex,
  }}
  className={
    isMobile
      ? "fixed inset-x-0 bottom-12 top-0 ..."
      : "absolute rounded-[8px] ..."
  }
>
  {/* Chrome Titlebar */}
  <div key="window-body" className="flex-1 overflow-hidden">
    {children}
  </div>
</div>
```
- Minimizing a window applies `display: 'none'` instead of unmounting.
- Toggling between Portrait and Landscape retains the identical React Fiber tree and active canvas memory.

### 5.3. Viewport Zoom Adaptation
A `ResizeObserver` attached to `viewportRef.current` recalculates the fit scale without mutating canvas dimensions:
```typescript
const scale = Math.min((vw - 48) / imageDims.width, (vh - 48) / imageDims.height, 1);
setZoom(Number(Math.max(0.1, scale).toFixed(2)));
```

---

## 6. Native Browser Storage Quota & Photo History Engine

### 6.1. Exact Native Quota Discovery
Rather than assuming a hardcoded 5 MB quota, Image Studio executes a non-destructive binary search probe once per session:
1. Calculates current `localStorage` utilization across all keys.
2. Conducts a 14-step binary probe writing temporary blocks (`64 KB` units) to `__radjaos_ls_quota_probe__` until the native browser throws `QuotaExceededError`.
3. Cleans up probe keys in a `finally` block and caches the detected limit (typically `5,242,880` units = `5.00 MB` on Chromium/Brave) in `sessionStorage`.

### 6.2. WebP Alpha Snapshot Encoding
Canvas states are encoded via `canvas.toDataURL("image/webp", 0.86)` with dimensions constrained to a maximum of `1600px` for storage while preserving native resolution on the active canvas. WebP preserves complete 8-bit alpha transparency while compressing file footprints by 80-90% relative to PNG data URLs.

### 6.3. Oldest-First Quota Eviction Loop
Before committing new uploads or edits, the engine evaluates total byte footprints:
```
Projected Bytes = Other Keys + History Key + Serialized Payload
```
If projected bytes exceed 98% of the native quota, the engine evicts the oldest non-active items until the payload fits. If a native `QuotaExceededError` triggers, a `while` loop aggressively evicts entries until the write succeeds, guaranteeing that the newest uploaded and edited photo is always preserved.

---

## 7. Modern Web Guidance Compliance Matrix

| Standard ID | Specification Domain | Applied Architectural Pattern |
| :--- | :--- | :--- |
| `size-aware-styling` | CSS Container Queries | Root container uses `container-type: inline-size` (`.studio-container`). Workspace layout dynamically adapts based on window container width via `@container (min-width: 680px)` with media query fallbacks. |
| `break-up-long-tasks` | Main Thread Scheduling | Helper `yieldToMainThread()` leverages `scheduler.yield()` with `setTimeout` fallback. History synchronization is debounced (180ms) and yields to prevent UI thread frame drops during brush strokes. |
| `individual-transform-properties` | CSS Transform Standards | Replaced monolithic `transform: scale()` with individual `scale: `${zoom}`` CSS property. |
| `touch-action` / `a11y` | Pointer & Assistive Standards | Canvas receives `touch-none` (`touch-action: none`) during brush interactions to block inadvertent viewport scrolling on touch/mobile displays, paired with semantic `role="img"` and dynamic `aria-label`. |

---

## 8. Export and Integration Pipelines

1. **PNG Export**: Exports full-resolution 32-bit RGBA images with alpha transparency.
2. **JPG Export**: Flattens transparent areas against user-selected backdrops (white, dark, passport red, passport blue, custom hex).
3. **WebP Export**: Compressed modern web delivery format.
4. **Clipboard Copy**: Direct binary write via `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`.
5. **RadjaOS Desktop Wallpaper**: Directly persists the edited canvas to client IndexedDB (`radjaos_custom_studio_wallpaper`) and dispatches `WALLPAPER_CHANGE_EVENT` to update the desktop background dynamically.
