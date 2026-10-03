# DESIGN.md - RadjaOS: Windows 11 Fluent 2 Design Specification

Spesifikasi sistem desain untuk transformasi portfolio Radja Genta Saputra ("RadjaOS") menjadi Web Desktop Clone Windows 11 otentik berbasis sistem desain **Microsoft Fluent 2**.

---

## 1. Design Tokens & Palette

### Neutral Colors (Dark Mode)
| Token Name | Hex / RGBA | Usage |
| :--- | :--- | :--- |
| `colorNeutralBackground1` | `#202020` / `rgba(32, 32, 32, 0.85)` | Window body canvas (Mica) |
| `colorNeutralBackground2` | `#1c1c1c` / `rgba(28, 28, 28, 0.78)` | Taskbar & Navigation base |
| `colorNeutralBackground3` | `#2d2d2d` / `rgba(45, 45, 45, 0.85)` | Start Menu & Flyout base (Acrylic) |
| `colorNeutralCard` | `rgba(255, 255, 255, 0.04)` | App Content Card surface |
| `colorNeutralCardHover` | `rgba(255, 255, 255, 0.08)` | App Content Card hover |
| `colorStrokeCard` | `rgba(255, 255, 255, 0.08)` | Card border |
| `colorStrokeFlyout` | `rgba(255, 255, 255, 0.12)` | Window & Flyout border |
| `colorCloseHover` | `#c42b1c` | Window Close button hover state |
| `colorCloseActive` | `#b22617` | Window Close button active state |

### Accent Colors (Windows 11 Default Blue)
| Token Name | Hex | Usage |
| :--- | :--- | :--- |
| `colorBrandPrimary` | `#0078d4` | Primary brand accent & start logo |
| `colorBrandLight` | `#60cdff` | Taskbar running indicator pill & high-contrast highlights |
| `colorBrandHover` | `#1084d8` | Accent hover buttons |
| `colorBrandBackground` | `rgba(0, 120, 212, 0.2)` | Selected item background pill |

---

## 2. Materials & Surface Recipes

### Mica (Persistent Surface: Windows & Taskbar)
```css
background-color: rgba(30, 30, 30, 0.82);
backdrop-filter: blur(30px) saturate(130%);
-webkit-backdrop-filter: blur(30px) saturate(130%);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 18px 45px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1);
```

### Acrylic (Transient Surface: Start Menu, Context Menu, Action Center Flyouts)
```css
background-color: rgba(36, 36, 36, 0.82);
backdrop-filter: blur(40px) saturate(150%);
-webkit-backdrop-filter: blur(40px) saturate(150%);
border: 1px solid rgba(255, 255, 255, 0.11);
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.18);
```

### Potato Mode / Eco Fallback (Zero GPU Blur)
```css
background-color: #1a1a1a;
border: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);
```

---

## 3. Typography & Hierarchy

- **Font Family**: `'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- **Scale**:
  - `Display`: 24px - 28px, Semibold (`font-semibold`), line-height 1.2
  - `Title`: 18px - 20px, Semibold (`font-semibold`), line-height 1.3
  - `Subtitle`: 14px - 15px, Medium (`font-medium`), line-height 1.4
  - `Body`: 13px, Regular (`font-normal`), line-height 1.5, color `#e2e8f0`
  - `Caption`: 11px - 12px, Regular, color `#94a3b8`

---

## 4. Component Measurements & Specifications

### Taskbar
- **Position**: Fixed bottom edge (`bottom-0 left-0 right-0`).
- **Height**: `48px` (`h-12`).
- **Layout**:
  - **Center**: Start button, Search button, Task View / Widgets, App icons (pinned + running).
  - **Running App Indicator**: Under active app icon, pill `width: 16px`, `height: 3px`, `background: #60cdff`, `border-radius: 2px`, positioned `bottom: 3px`. Inactive open apps show smaller pill (`width: 6px`, `height: 3px`, `background: #94a3b8`). On hover, expands smoothly to `20px`.
  - **Right (System Tray)**:
    - Chevron overflow icon
    - Language switcher pill (`ENG`, `ID`, `JP`)
    - Combined Quick Settings pill (WiFi + Volume + Battery) -> Opens Quick Settings Flyout
    - Stacked Date & Time (Time on top, Date on bottom) -> Opens Calendar Flyout
    - Show Desktop strip (`w-1.5 h-full hover:bg-white/15 border-l border-white/10`) on extreme right edge.

### Window Chrome & Titlebar
- **Height**: `38px`.
- **Corner Radius**: `8px` (`rounded-[8px]`).
- **Header Structure**:
  - Left: App 16x16 icon + Window Title (12px, font-medium).
  - Center: Draggable area.
  - Right: Windows 11 Caption Controls:
    - **Minimize** (`―`): `w-11 h-full hover:bg-white/10 flex items-center justify-center text-xs`.
    - **Maximize / Restore** (`□` / `❐`): `w-11 h-full hover:bg-white/10 flex items-center justify-center text-xs`. Shows Snap Layouts tooltip preview on hover.
    - **Close** (`✕`): `w-11 h-full hover:bg-[#c42b1c] hover:text-white flex items-center justify-center text-xs transition-colors`.

### Start Menu Flyout
- **Position**: Centered above taskbar (`bottom-14 left-1/2 -translate-x-1/2`).
- **Dimensions**: `width: 580px`, `max-width: 95vw`, `height: 580px`.
- **Corner Radius**: `12px` (`rounded-xl`).
- **Sections**:
  1. Top Search Bar with rounded-md and Windows search icon.
  2. "Pinned" Section with grid of 6 columns x 2 rows of app shortcuts.
  3. "Recommended" Section featuring recent projects & quick links (GitHub, Resume, SIDIGS Tech Lead role).
  4. Bottom User Bar: User avatar (Radja Genta) + Full Name + Power menu trigger (Restart, BSOD, Lock, Sleep).

### Desktop Icons
- **Layout**: Left-aligned vertical column grid.
- **Icon Container**: `w-[76px] h-[82px]`, rounded `6px`.
- **Selection / Hover**: `hover:bg-white/10 border border-transparent hover:border-white/15 active:bg-blue-600/30`.
- **Label**: `11px` Segoe UI with `text-shadow: 0 1px 2px rgba(0,0,0,0.85)`.

### Desktop Context Menu (Right Click)
- **Position**: Dynamic absolute at cursor coordinate.
- **Surface**: Windows 11 Acrylic (`backdrop-blur-2xl bg-[#202020]/90 border border-white/10 rounded-lg p-1.5 shadow-2xl`).
- **Actions**: View options, Sort by, Refresh, Personalize (opens Settings), Open Terminal, About RadjaOS.

---

## 5. Anti-Patterns to Eliminate
- ❌ **macOS Traffic Lights**: Hapus dot merah/kuning/hijau di kiri titlebar. Gantikan dengan caption buttons Windows 11 di kanan titlebar (`―`, `□`, `✕`).
- ❌ **macOS Top Menu Bar & Floating Bottom Dock**: Hilangkan status bar di atas dan dock terapung melengkung. Gantikan dengan Taskbar Windows 11 tunggal di bawah.
- ❌ **Generic AI Dark/Blue Glow Orbs**: Hapus radial neon glow orbs berlebih yang khas template AI. Gunakan wallpaper resmi Windows 11 Dark Bloom sebagai preset utama.
- ❌ **Generic Lucide Cards**: Gunakan ikon otentik Fluent / Windows 11 untuk desktop shortcuts dan app headers.
