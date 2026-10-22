# RadjaOS Desktop Pro

A high-fidelity, client-side web desktop operating system and developer portfolio for **Radja Genta Saputra (RadjaShiqnals)**.

Built with **Astro 5**, **React 19**, **Tailwind CSS v4**, and **TypeScript**, RadjaOS delivers the tactile ergonomics, fluid window management, authentic terminal emulation, and aesthetic polish of a modern desktop environment directly within the web browser.

---

## 1. Look-Alike Architecture & Design Philosophy

RadjaOS operates under a strict **Look-Alike Non-Trademark Policy**:
- **Design Inspiration**: Emulates the ergonomics, centered taskbar, floating window mechanics, and acrylic materials of contemporary desktop operating systems without utilizing proprietary commercial trademarks, logos, or brand vectors.
- **Analogy**: Just as *DaVinci Resolve* provides a professional look-alike alternative to *Adobe Premiere*, or *LibreOffice* to *Microsoft Office*, **RadjaOS** is an independent, standalone web desktop environment governed by its own token system (*RadjaOS Design System* / RODS).
- **Client-Side Execution**: All developer utilities, media players, document viewers, and text transformers run 100% offline within the browser runtime using WebAssembly, Web Audio API, and local Web APIs. Zero telemetry and zero third-party tracking.

---

## 2. Core Architectural Features

- **Centered System Taskbar (48px)**:
  - Centered dock launcher with active running application indicator pills (16px cyan active pill, 6px idle dot, smooth hover expansion to 20px).
  - RadjaOS 4-Tile Rounded Brand Badge for the Start Menu launcher.
  - Action Center and System Tray with real-time digital clock, calendar flyout, Quick Settings (WiFi, Sound, Eco Mode, volume & brightness sliders), and trilingual language switcher.
- **Window Management System**:
  - Full floating window lifecycle: open, close, minimize, maximize, restore, and coordinate dragging.
  - Monotonic z-index stacking context ensuring the focused window remains atop the viewport.
  - Collision-safe desktop grid layout persistent across viewport resizes with IndexedDB and LocalStorage fallback.
- **Mobile Responsive Sheet Mode (<768px)**:
  - Adaptive viewport transformation: on smaller screens, floating windows automatically morph into full-height mobile sheets (`inset-x-0 bottom-12 top-0`) with dedicated touch-friendly minimize (`―`) and close (`✕`) caption controls.
  - Adaptive taskbar dock that automatically hides inactive shortcuts on mobile, rendering only open apps to prevent horizontal overflow.
  - Multi-column launcher grid on mobile displays.
- **Radja Terminal Emulator**:
  - Tabbed terminal interface running **RadjaShell** (`rsh`).
  - **Oh My Posh** segmented prompt: `╭─ [ radja-sh ] ─ [ ~\RadjaOS ] ─ [ git:(main) ]` `╰─$ `.
  - System telemetry (`fetch`, `sysinfo`, `neofetch`) displaying the RadjaOS 4-tile geometric ASCII glyph, ANSI terminal color dots, and workstation hardware telemetry.
  - Interactive commands, suggestion pills, and system easter eggs.
- **Surface Materials & Visual Polish**:
  - **Frosted Glass Surface**: Multi-stop backdrop blur (30px) and saturation boost for active windows and canvas panels.
  - **Deep Acrylic Surface**: 40px backdrop blur with specular lighting for flyouts and the right-click desktop context menu.
  - **Eco / Potato Mode**: Toggleable low-spec hardware mode that disables GPU backdrop filters and switches to wireframe dragging to guarantee 60fps on battery-constrained devices.
- **Procedural Audio Synthesis**:
  - Built-in Web Audio API synthesizer for native OS sound effects (window open, click, minimize, error beep) without external audio file requests.
- **Trilingual Localization (i18n)**:
  - Instant locale switching across English (`en`), Indonesian (`id`), and Japanese (`ja`).

---

## 3. Application Registry

RadjaOS features a modular suite of 24 applications organized into four functional domains:

### Portfolio & System Applications

| Application | Identifier | Description |
| :--- | :--- | :--- |
| **About Me** | `about` | Personal biography, technical profile, social links, and QRIS support. |
| **Projects** | `projects` | Interactive portfolio showcase, modal galleries, and repository links. |
| **Skills** | `skills` | Categorized technical proficiency matrix across Frontend, Backend, and DevOps. |
| **Experience** | `experience` | Career history timeline and engineering milestones at SIDIGS. |
| **Terminal** | `terminal` | Tabbed shell emulator with Oh My Posh prompt and simulated CLI commands. |
| **Settings** | `settings` | System preferences: wallpaper switcher, Eco Mode, volume, and language. |
| **Recycle Bin** | `trash` | Satirical storage cleaner for `node_modules` and cache artifacts. |

### Productivity Suite

| Application | Identifier | Description |
| :--- | :--- | :--- |
| **Pomodoro Focus** | `pomodoro` | Customizable interval focus timer with session logs and procedural chimes. |
| **Text Workbench** | `text` | Live Markdown editor with GFM preview, HTML-to-Markdown, and regex transformers. |
| **Media Player** | `media` | Local audio and video playback engine supporting custom playlist management. |
| **Document Viewer** | `documents` | In-browser viewer for PDF (`pdfjs-dist`), Excel/CSV (`read-excel-file`, `papaparse`), and Word documents (`mammoth`). |

### Developer Tools Suite

| Application | Identifier | Description |
| :--- | :--- | :--- |
| **Code Studio** | `code` | In-browser Monaco editor IDE with multi-tab workspace, TypeScript syntax highlighting, and code templates. |
| **Data Converter** | `converter` | Bidirectional data converter supporting JSON, YAML, TOML, TypeScript interfaces, Zod schemas, and CSV. |
| **Git Cheatsheet** | `git` | Searchable command reference, visual branching diagrams, and everyday workflow recipes. |
| **Code Formatter** | `formatter` | Client-side Prettier formatting engine for JavaScript, TypeScript, HTML, CSS, JSON, and Markdown. |
| **JSON Toolkit** | `json` | Interactive collapsible JSON tree viewer, schema validator, and minifier. |
| **Base64 Studio** | `base64` | Multi-byte UTF-8 string encoder/decoder, URL escaper, and image Data URI converter. |
| **Hash Lab** | `hash` | Cryptographic digest generator for MD5, SHA-1, SHA-256, and SHA-512 hashes. |
| **JWT Inspector** | `jwt` | JWT token parser with visual header/payload decomposition and expiration timestamps. |
| **UUID Forge** | `uuid` | Cryptographically secure UUID v4 batch generator and high-entropy random token generator. |
| **Epoch Clock** | `epoch` | Live Unix timestamp ticker and bidirectional Human Date <-> Epoch timestamp converter. |
| **QR Studio** | `qr` | Client-side QR code generator supporting custom sizes, error correction levels, and PNG export. |
| **DevTools Hub** | `tools` | Consolidated master-detail toolbox housing all developer utilities in a single window. |

### Creative Suite

| Application | Identifier | Description |
| :--- | :--- | :--- |
| **Image Studio** | `studio` | In-browser AI image background removal and photo editing powered by WebAssembly (`@imgly/background-removal`). |
| **Color Studio** | `color` | OKLCH color picker, palette generator, and WCAG 2.1 AA/AAA contrast ratio compliance analyzer. |

---

## 4. Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (Static Site Architecture)
- **UI Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Editor Engine**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Typography & Icons**: [Lucide React](https://lucide.dev/), Montserrat Variable
- **Document & Data Engines**:
  - `marked`, `dompurify`, `turndown`
  - `pdfjs-dist`, `mammoth`, `read-excel-file`, `papaparse`
  - `prettier`, `yaml`, `smol-toml`, `json5`
  - `@imgly/background-removal`, `cropperjs`, `culori`, `qrcode`
- **Audio Engine**: Procedural Web Audio API sound synthesis
- **Client Persistence**: IndexedDB (`idb-keyval`) and LocalStorage

---

## 5. Repository Layout

```
.
├── docs/                                  # Canonical technical specifications (zero emoji)
│   ├── README.md                          # Master documentation index
│   ├── architecture/                      # System models, window manager, mobile responsive
│   ├── design-system/                     # Design tokens, surface materials, typography
│   ├── components/                        # Taskbar, window chrome, start menu, flyouts
│   ├── apps/                              # Terminal spec, app registry, content cards
│   └── conventions/                       # TypeScript rules, Tailwind syntax, anti-patterns
├── public/
│   ├── image/                             # Static visual assets
│   │   ├── wallpaper/                     # High-resolution desktop wallpapers
│   │   └── win11/                         # Custom vector and desktop application icons
│   └── favicon.svg                        # Site favicon
├── src/
│   ├── components/
│   │   └── desktop/                       # Core desktop environment components
│   │       ├── apps/                      # Modular desktop applications (24 apps)
│   │       ├── AppHost.tsx                # Dynamic application host and error boundaries
│   │       ├── ContextMenu.tsx            # Desktop right-click acrylic context menu
│   │       ├── DesktopEnv.tsx             # Master desktop container and window manager
│   │       ├── DesktopIcon.tsx            # Interactive desktop shortcut tile
│   │       ├── DesktopSurface.tsx         # Collision-safe icon grid surface
│   │       ├── LoginScreen.tsx            # Lock screen authentication and clock
│   │       ├── Taskbar.tsx                # Centered 48px taskbar, flyouts, system tray
│   │       └── WindowFrame.tsx            # Draggable window frame with caption controls
│   ├── data/                              # Static portfolio content and manifests
│   ├── lib/                               # Core state machines, utilities, i18n
│   ├── pages/                             # Astro root entrypoint
│   └── styles/                            # Global styles, Tailwind directives, glass classes
├── AGENTS.md                              # Mandatory architectural rules for AI agents
├── LICENSE                                # MIT License file
├── package.json
├── tailwind.config.cjs
└── tsconfig.json
```

---

## 6. Getting Started

### Prerequisites
- Node.js 22.12.0 or higher
- npm, pnpm, or bun

### Development Workflow

```bash
# Clone the repository
git clone https://github.com/radjashiqnals/radjashiqnals.github.io.git
cd radjashiqnals.github.io

# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript and Astro template diagnostics
npx astro check

# Execute production static build
npm run build
```

---

## 7. License

This repository is licensed under the [MIT License](file:///home/radjashiqnals/coding/side-project/radjashiqnals.github.io/LICENSE).

```text
Copyright (c) 2026 Radja Genta Saputra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
```

---

## 8. Third-Party Notices & Asset Takedown Requests

### Open-Source Acknowledgments
RadjaOS incorporates third-party open-source libraries that remain subject to their original licenses:
- `@imgly/background-removal` is distributed under the GNU Affero General Public License v3 (AGPL-3.0).
- Monaco Editor, Lucide, Astro, React, and Tailwind CSS are distributed under their respective permissive licenses (MIT / Apache-2.0 / ISC).

### Intellectual Property & Asset Removal Policy
RadjaOS is a non-commercial, personal portfolio and interactive engineering demonstration. Certain static media assets (such as sample wallpapers and brand reference logos) remain the intellectual property and copyright of their respective artists, publishers, and rights holders.

If you are a copyright holder or authorized representative and believe that any media asset, wallpaper, or icon hosted within this repository infringes upon your copyright or trademark rights, or if you require an attribution adjustment, please submit an asset removal request directly to:

- **Contact**: Radja Genta Saputra
- **Email**: `radjashiqnals@gmail.com`
- **Subject**: `[Asset Removal Request] radjashiqnals.github.io`

Upon receipt of a valid request identifying the specific asset URL or repository path, the disputed material will be promptly reviewed and removed from the repository.

---

## 9. Author

**Radja Genta Saputra**  
Junior Full Stack Developer & Tech Lead at SIDIGS  
Malang / Probolinggo, East Java, Indonesia  
- Website: [radjashiqnals.github.io](https://radjashiqnals.github.io)
- GitHub: [@radjashiqnals](https://github.com/radjashiqnals)
- LinkedIn: [Radja Genta Saputra](https://linkedin.com/in/radjashiqnals)
- Email: [radjashiqnals@gmail.com](mailto:radjashiqnals@gmail.com)
