# AGENTS.md - Technical Architecture & Developer Guidelines for RadjaOS

## 1. System Identity and Architectural Mission

RadjaOS is a high-fidelity, web-based desktop environment built on Astro 5, React 19, and Tailwind CSS. The system delivers a premium modern desktop operating system experience directly within the browser, utilizing a centered taskbar, floating window management, flyout action centers, and an authentic terminal emulator.

### 1.1 Strict Non-Trademark Look-Alike Policy
RadjaOS follows a strict look-alike architectural policy. It emulates the visual ergonomics and functional paradigms of modern desktop operating systems without utilizing trademarked proprietary nomenclature, commercial logos, or direct intellectual property references.

Governing Rules:
- Prohibited Terms in UI, Code, and Documentation: Never use "Windows 11", "Windows NT", "Microsoft", "PowerShell", "Edge", "macOS", or "Hyprland" within the desktop UI shell, system strings, or documentation.
- System Designation: The operating system is designated exclusively as "RadjaOS" or "RadjaOS Desktop Pro".
- Design System: The visual framework is termed "RadjaOS Design System (RODS)" or "Modern Glassmorphic Desktop System".
- Surface Materials: Translucent frosted elements are designated as "Frosted Glass Surface" (canvas/windows) and "Deep Acrylic Surface" (flyouts and menus).
- Terminal Runtime: The shell emulator is designated as "Radja Terminal Emulator" executing "RadjaShell" (rsh) with Oh My Posh segmented styling.
- Start Launcher Glyph: The primary launcher trigger utilizes the "RadjaOS 4-Tile Rounded Badge" featuring four rounded tiles with cyan and royal blue gradients, distinct from flat commercial vectors.

### 1.2 Documentation Formatting Standard
All markdown documentation within the repository (including docs/ and AGENTS.md) must strictly contain zero emojis. All documentation must use formal, rigorous, deep-technical prose with precise terminology, architectural diagrams, and explicit code signatures.

---

## 2. Repository Layout & Module Boundaries

The repository is structured into distinct presentation, state, and asset layers:

```
.
├── docs/                                  # Canonical technical specifications (zero emoji)
│   ├── architecture/                      # System models, window manager, mobile responsive
│   ├── design-system/                     # Design tokens, surface materials, typography
│   ├── components/                        # Taskbar, window chrome, start menu, flyouts
│   ├── apps/                              # Terminal spec, app registry, content cards
│   └── conventions/                       # TypeScript rules, Tailwind syntax, anti-patterns
├── public/
│   ├── image/                             # Static visual assets
│   │   ├── wallpaper/                     # High-resolution desktop wallpapers
│   │   └── win11/                         # Fluent-style 3D application icons
│   └── favicon.svg                        # Site favicon
├── src/
│   ├── components/
│   │   └── desktop/                       # Core desktop environment components
│   │       ├── apps/                      # Modular desktop applications
│   │       │   ├── AboutApp.tsx           # Profile, biographic data, QRIS support
│   │       │   ├── ExperienceApp.tsx      # Professional career history and timeline
│   │       │   ├── ProjectsApp.tsx        # Portfolio showcase and modal gallery
│   │       │   ├── SettingsApp.tsx        # System preferences, wallpaper DB, eco mode
│   │       │   ├── SkillsApp.tsx          # Technical proficiency arsenal
│   │       │   ├── TerminalApp.tsx        # Tabbed RadjaShell terminal emulator
│   │       │   └── TrashApp.tsx           # Satirical recycle bin and node_modules cleaner
│   │       ├── ContextMenu.tsx            # Desktop right-click acrylic context menu
│   │       ├── DesktopEnv.tsx             # Master desktop container, z-index, shortcuts
│   │       ├── DesktopIcon.tsx            # Interactive desktop shortcut tile
│   │       ├── LoginScreen.tsx            # Lock screen authentication and clock
│   │       ├── Taskbar.tsx                # Centered 48px taskbar, flyouts, system tray
│   │       └── WindowFrame.tsx            # Draggable window frame with caption controls
│   ├── data/                              # Static portfolio content and manifests
│   ├── lib/                               # Core state machines, utilities, i18n
│   │   ├── i18n.ts                        # Trilingual localization dictionary (en, id, ja)
│   │   ├── os-state.ts                    # Global sound and performance mode states
│   │   ├── sound.ts                       # Web Audio API procedural sound synthesis
│   │   ├── wallpaper-db.ts                # Client-side IndexedDB wallpaper persistence
│   │   └── wallpaper-state.ts             # Wallpaper presets and active selection store
│   ├── pages/
│   │   └── index.astro                    # Root Astro entrypoint mounting React desktop
│   └── styles/
│       └── global.css                     # Global styles, Tailwind directives, glass classes
├── AGENTS.md                              # Technical guide for AI agents
├── astro.config.mjs                       # Astro build configuration
├── package.json                           # Dependencies and scripts
├── tailwind.config.cjs                    # Tailwind configuration
└── tsconfig.json                          # TypeScript strict configuration
```

---

## 3. Development Server & Lifecycle Commands

### 3.1 Background Execution Standard
When initializing or managing the development server, always utilize background execution mode as defined in the repository tooling:

```bash
# Start Astro dev server in the background
astro dev --background

# Inspect background dev server status
astro dev status

# Stream background server logs
astro dev logs

# Terminate background server instance
astro dev stop
```

### 3.2 Verification and Quality Assurance
Prior to completing any work step, execute the verification suite:

```bash
# Validate TypeScript and Astro template types
npx astro check

# Execute production static site compilation
npm run build
```

---

## 4. Visual & Structural Invariants

Every agent modifying UI components must adhere strictly to these invariants:

1. Taskbar Geometry:
   - Fixed height: 48px (`h-12`).
   - Location: Bottom edge (`bottom-0 left-0 right-0`).
   - Center App Launcher: Pinned application shortcuts with active running indicators. Active apps feature a 16px wide, 3px high cyan indicator (`#60cdff`). Inactive open apps feature a 6px wide dot. Hover state animates width smoothly to 20px.
   - Mobile Viewport Behavior: On screens narrower than 768px (`< md`), inactive pinned shortcuts are hidden to prevent overflow. Only open/running applications are rendered in the dock.
2. Window Chrome & Caption Controls:
   - Titlebar height: 38px (`h-9` or `38px`).
   - Window Corner Radius: 8px (`rounded-[8px]`).
   - Caption Buttons (Right-aligned):
     - Minimize: Width 44px (`w-11`), label `―`.
     - Maximize / Restore: Width 44px (`w-11`), label `□` or `❐`.
     - Close: Width 44px (`w-11`), label `✕`, hover state background `#c42b1c`, text white.
   - Window Body: Backed by `Frosted Glass Surface` (`backdrop-blur-2xl bg-[#202020]/88 border border-white/15`).
3. Mobile Sheet Mode:
   - On viewports narrower than 768px, windows transform from floating draggable containers to full-height mobile sheets (`inset-x-0 bottom-12 top-0`).
   - Caption controls in mobile sheet mode must include both Minimize (`―`) and Close (`✕`) buttons to allow taskbar minimization without state destruction.
4. Desktop Shortcut Grid:
   - Desktop viewports: Left-aligned vertical column (`md:flex md:flex-col md:flex-wrap`).
   - Mobile viewports: Multi-column grid (`grid grid-cols-3 sm:grid-cols-4 gap-y-5 gap-x-2`).
5. Eco / Potato Mode:
   - When Eco Mode is enabled via Quick Settings or SettingsApp, all expensive GPU backdrop-filter blur shaders are disabled.
   - Window dragging transitions to an optimized dashed wireframe ghost to preserve 60fps on integrated or battery-constrained hardware.

---

## 5. Prohibited Anti-Patterns

The following design and implementation patterns are strictly prohibited in RadjaOS:

1. No Cross-OS Hybrid Clashes:
   - Do not display Linux window manager terminologies (e.g. Hyprland, Waybar, Caelestia) in the desktop shell or terminal fetch output.
   - Do not introduce macOS idioms, including top-of-screen global menu bars, floating rounded docks with magnification, or red/yellow/green traffic light titlebar controls.
2. No Trademarked System Names:
   - Never render "Windows 11", "Microsoft", "PowerShell", or "Edge" on buttons, titles, watermarks, or terminal output.
3. No Generic AI Design Tropes:
   - Avoid oversized radial neon glow orbs, identical rounded card grids without content differentiation, and arbitrary purple/cyan gradient overlays.
4. No Emojis in Technical Documentation:
   - All documentation in `docs/` and `AGENTS.md` must be written without emoji characters.
