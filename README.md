# RadjaOS Desktop Pro

A full **vibe-coded** interactive web desktop operating system and personal developer portfolio for **Radja Genta Saputra (RadjaShiqnals)**.

Built with **Astro 5**, **React 19**, **Tailwind CSS**, and **TypeScript**, RadjaOS brings the tactile ergonomics, fluid window management, and aesthetic polish of a modern desktop environment directly into the web browser.

---

## Look-Alike Architecture & Design Philosophy

RadjaOS operates under a strict **Look-Alike Non-Trademark Policy**:
- **Design Inspiration**: Emulates the ergonomics, centered taskbar, floating window mechanics, and acrylic materials of contemporary desktop operating systems without using proprietary commercial trademarks, logos, or brand vectors.
- **Analogy**: Just as *DaVinci Resolve* provides a professional look-alike alternative to *Adobe Premiere*, or *LibreOffice* to *Microsoft Office*, **RadjaOS** is an independent, standalone web desktop environment with its own unique design tokens (*RadjaOS Design System* / RODS).
- **Vibe Coded Execution**: Built autonomously through rapid iterative vibe coding, focusing on fluid user experience, authentic micro-interactions, responsive adaptability, and robust architectural standardization.

---

## Key Features

- **Centered System Taskbar (48px)**:
  - Iconic centered dock launcher with active running application indicator pills (16px cyan active pill, 6px idle dot, smooth hover expansion).
  - RadjaOS 4-Tile Rounded Brand Badge for the Start Menu launcher.
  - Action Center / System Tray with realtime digital clock, calendar flyout, Quick Settings (WiFi, Sound, Eco Mode, volume & brightness sliders), and trilingual language switcher.
- **Window Management System**:
  - Full floating window lifecycle: open, close, minimize, maximize, restore, and drag.
  - Monotonic z-index stacking context ensuring the focused window always stays on top.
  - Performance-optimized dragging via pointer coordinates and `requestAnimationFrame`.
- **Mobile Responsive Sheet Mode (<768px)**:
  - Adaptive viewport transformation: on smaller screens, floating windows automatically morph into full-height mobile bottom sheets with dedicated touch-friendly minimize (`―`) and close (`✕`) caption controls.
  - Adaptive taskbar dock that automatically hides inactive shortcuts on mobile, rendering only open apps to prevent horizontal overflow.
  - Desktop shortcut grid reflowing into a clean 3-column launcher grid on mobile displays.
- **Radja Terminal Emulator**:
  - Tabbed terminal interface running **RadjaShell** (`radja-sh`).
  - **Oh My Posh** segmented prompt: `╭─ [ radja-sh ] ─ [ ~\RadjaOS ] ─ [ git:(main) ]` `╰─$ `.
  - System telemetry (`fetch`, `sysinfo`, `neofetch`) displaying the RadjaOS 4-tile geometric ASCII glyph, 8 ANSI terminal color dots, and workstation hardware telemetry.
  - Interactive commands, suggestion pills, and fun easter eggs (`mommy`, `sudo`, `rm -rf /` BSOD simulation).
- **Surface Materials & Visual Polish**:
  - **Frosted Glass Surface**: Multi-stop backdrop blur (30px) and saturation boost for active windows and canvas panels.
  - **Deep Acrylic Surface**: 40px backdrop blur with specular lighting for flyouts and the right-click desktop context menu.
  - **Eco / Potato Mode**: Toggleable low-spec hardware mode that disables expensive GPU backdrop filters and switches to wireframe dragging.
- **Client-Side Developer Utilities Suite (Tools App)**:
  - 100% offline, client-side developer utility hub executing directly in the browser runtime without external API dependencies, network calls, or CORS limits.
  - Master-detail architecture with categorical tabs (*All*, *Formatters*, *Converters*, *Security*, *Generators*) and instant text search filtering.
  - 8 production-ready local tools:
    - **JSON Formatter & Validator**: 2/4/tab indentation, minifier, byte/key stats, and real-time syntax error diagnosis.
    - **Base64 & URL Converter**: Multi-byte UTF-8 text encoder/decoder, URL encoder, and image-to-Base64 Data URI converter with live preview.
    - **Hash & Checksum Machine**: Instant MD5, SHA-1, SHA-256, and SHA-512 cryptographic digests with uppercase hex toggle and one-click copy.
    - **JWT Token Inspector**: Header & Payload claim inspector, expiration status, and formatted local time conversion.
    - **UUID & Token Studio**: Batch UUID v4 generator with hyphen stripping and uppercase options, plus high-entropy cryptographically secure random token generator.
    - **Unix Epoch Converter**: Realtime live ticking epoch clock and bidirectional Unix Timestamp $\leftrightarrow$ Human Readable Date (WIB & UTC) conversion.
    - **QR Code Studio**: Client-side canvas QR generator with custom sizes, error correction levels (L/M/Q/H), PNG export, and Data URI copy.
    - **Color & Contrast Studio**: HEX color picker, WCAG 2.1 relative luminance calculation, AA/AAA contrast pass/fail compliance ratings, and live test card.
  - Full desktop shell integration: accessible via Desktop shortcut, centered Taskbar dock, Start Menu, Desktop Context Menu (*Open Dev Tools*), and RadjaShell (`tools` / `devtoys` CLI commands).
- **Procedural Audio Synthesis**:
  - Built-in Web Audio API synthesizer for native OS sound effects (window open, click, minimize, error beep) without external MP3/WAV assets.
- **Wallpaper System & Persistence**:
  - Dynamic wallpaper switcher with IndexedDB client-side persistence and custom image upload cropper.
- **Trilingual Localization (i18n)**:
  - Seamless instant locale switching between English (`en`), Indonesian (`id`), and Japanese (`ja`).

---

## Included Applications

| Application | Icon | Description |
| :--- | :--- | :--- |
| **About Me** | This PC | Profile overview, bio, social links, and QRIS support. |
| **Projects** | Folder | Interactive portfolio showcase, live preview modals, tech tags, and links. |
| **Skills** | Code Editor | Categorized technical proficiency matrix (Frontend, Backend, DevOps, Tools). |
| **Experience** | Browser | Career history timeline and role achievements at SIDIGS. |
| **Terminal** | Terminal | Authentic tabbed shell emulator with Oh My Posh styling and CLI commands. |
| **Tools** | Task Manager | 100% offline client-side developer utilities suite (JSON, QR, Hash, JWT, UUID, Epoch, Contrast). |
| **Settings** | Settings | Personalization hub: wallpaper selector, Eco Mode, volume, and language. |
| **Recycle Bin** | Trash | Satirical storage cleaner for `node_modules` and temporary files. |

---

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (Static Site Generation)
- **UI Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Segoe UI Variable / Inter / Montserrat Variable
- **Sound**: Native Web Audio API procedural synthesis
- **Storage**: IndexedDB (`idb-keyval` / custom wrapper) + LocalStorage

---

## Repository Structure & Documentation

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
│   ├── image/                             # Static visual assets & wallpapers
│   └── favicon.svg                        # Site favicon
├── src/
│   ├── components/desktop/                # React desktop environment components
│   │   ├── apps/                          # Modular desktop applications
│   │   ├── ContextMenu.tsx                # Right-click desktop menu
│   │   ├── DesktopEnv.tsx                 # Master desktop container & window manager
│   │   ├── DesktopIcon.tsx                # Desktop shortcut tiles
│   │   ├── LoginScreen.tsx                # Lockscreen & bootloader
│   │   ├── Taskbar.tsx                    # Centered taskbar & flyout centers
│   │   └── WindowFrame.tsx                # Floating window chrome & captions
│   ├── data/                              # Static portfolio content and manifests
│   ├── lib/                               # State machines, sound, i18n, wallpaper DB
│   ├── pages/                             # Astro entrypoint
│   └── styles/                            # Global CSS and surface utility classes
├── AGENTS.md                              # Mandatory guidelines for future AI agents
├── DESIGN.md                              # Modern desktop design brief & token specifications
└── package.json
```

For complete technical specifications, see [`docs/README.md`](file:///home/radjashiqnals/coding/side-project/radjashiqnals.github.io/docs/README.md) and [`AGENTS.md`](file:///home/radjashiqnals/coding/side-project/radjashiqnals.github.io/AGENTS.md).

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, pnpm, or bun

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/radjashiqnals/radjashiqnals.github.io.git
cd radjashiqnals.github.io

# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript and Astro template typecheck
npx astro check

# Build production static bundle
npm run build
```

---

## Author

**Radja Genta Saputra**  
Junior Full Stack Developer & Tech Lead at SIDIGS  
Malang / Probolinggo, East Java, Indonesia  
- GitHub: [@radjashiqnals](https://github.com/radjashiqnals)
- LinkedIn: [Radja Genta Saputra](https://linkedin.com/in/radja-genta-saputra)
