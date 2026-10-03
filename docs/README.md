# RadjaOS Technical Documentation Master Index

Master technical index, architectural philosophy, document navigation tree, and governance standards for the RadjaOS web desktop operating system environment.

---

## 1. System Mission and Identity

RadjaOS is an autonomous, high-fidelity, high-performance web desktop operating system and interactive developer portfolio. Engineered for modern web browsers using Astro 5, React 19, and Tailwind CSS, RadjaOS simulates the tactile responsiveness, visual elegance, and multitasking capabilities of a modern desktop environment.

### Core Architectural Pillars
- **Zero-Compromise Performance**: Sustains 60+ FPS window drags and animations via `requestAnimationFrame` and direct DOM transform pipelines, accompanied by Potato Mode for low-tier hardware.
- **Fluent Material Realism**: Employs layered translucent surfaces (Mica and Acrylic recipes) with calibrated subtle strokes, deep drop shadows, and backdrop filters.
- **Autonomous Operating Identity**: RadjaOS is an independent proprietary web desktop platform. It does not license, emulate, or fork commercial desktop operating systems.
- **Strict Quality Invariants**: Enforces strict TypeScript verification, ordered utility styling, zero-emoji technical documentation, and automated CI gate checks.

---

## 2. Documentation Directory Map

```
docs/
├── README.md
│   Master technical index, architectural manifesto, navigation matrix, and revision log.
│
├── apps/
│   ├── terminal-specification.md
│   │   Radja Terminal Emulator architecture, multi-tab bar specifications, Oh My Posh
│   │   styled prompt segmentation, sysinfo 4-tile geometric ASCII emblem, and CLI catalog.
│   │
│   ├── app-registry.md
│   │   Complete manifest of the 7 default applications (About Me, Projects, Skills,
│   │   Experience, Terminal, Settings, Recycle Bin), geometric constraints, and lifecycle state.
│   │
│   └── app-content-standards.md
│       Window canvas layouts, card design tokens (white/0.04 surface, 1px subtle border),
│       buttons, status chips, modal lightboxes, and accessibility (a11y) standards.
│
└── conventions/
    ├── code-style-and-linting.md
    │   TypeScript strict mode rules, interface naming, React 19 component patterns,
    │   five-tier Tailwind ordering schema, and storage architecture.
    │
    └── anti-patterns.md
        Catalog of strictly prohibited practices: external trademark usage, traffic-light
        window controls, generic AI radial glow orbs, emojis, and memory leak patterns.
```

---

## 3. Comprehensive Document Navigation Matrix

| Document Path | Focus Area | Key Architectural Deliverables |
| :--- | :--- | :--- |
| [`docs/apps/terminal-specification.md`](./apps/terminal-specification.md) | Virtual CLI Runtime | - RadjaShell (`radja-sh`) tokenization pipeline<br>- Acrylic multi-tab navigation strip<br>- Oh My Posh powerline prompt segmentation<br>- RadjaOS 4-tile ASCII telemetry engine (`fetch`)<br>- Command execution registry and error codes |
| [`docs/apps/app-registry.md`](./apps/app-registry.md) | Application Management | - Central 7-application registry manifest<br>- Initial dimensions and cascade offsets<br>- Window lifecycle state machine<br>- Single-instance process management<br>- Desktop and taskbar routing triggers |
| [`docs/apps/app-content-standards.md`](./apps/app-content-standards.md) | Window UI & Design Tokens | - Standard vs Full-bleed layout containers<br>- Translucent card design tokens (`rgba(255,255,255,0.04)`)<br>- Four-tier button classification<br>- Lightbox modal and gallery specifications<br>- Accessibility and WCAG AA contrast rules |
| [`docs/conventions/code-style-and-linting.md`](./conventions/code-style-and-linting.md) | Code Standards & Typing | - TypeScript strict mode compiler settings<br>- Interface vs Type structural conventions<br>- React 19 ref handling and rAF throttling<br>- 5-Tier Tailwind utility ordering rule<br>- Storage naming and IndexedDB binary cache |
| [`docs/conventions/anti-patterns.md`](./conventions/anti-patterns.md) | Architectural Guardrails | - Forbidden third-party commercial trademarks<br>- Absolute ban on top-left traffic light buttons<br>- Ban on generic AI purple/neon radial glow orbs<br>- Strict zero emoji policy in documentation<br>- Performance regression countermeasures |

---

## 4. Cross-Reference and Traceability Index

### 4.1. Visual System Traceability
- **Mica Surface**: Implemented in `src/components/desktop/WindowFrame.tsx` and documented in `docs/apps/app-content-standards.md` (Section 3).
- **Acrylic Surface**: Implemented in `src/components/desktop/ContextMenu.tsx`, `Taskbar.tsx`, and `docs/apps/terminal-specification.md` (Section 2).
- **Caption Controls**: Implemented on the top-right of `WindowFrame.tsx` and governed by `docs/conventions/anti-patterns.md` (Section 3).
- **Potato Mode Fallback**: Implemented in `src/lib/os-state.ts`, toggled via `SettingsApp.tsx`, and documented across `docs/apps/app-content-standards.md` and `docs/conventions/code-style-and-linting.md`.

### 4.2. Application Process Traceability
- **Process Orchestration**: Centralized in `src/components/desktop/DesktopEnv.tsx` and specified in `docs/apps/app-registry.md`.
- **Command Dispatcher**: Implemented in `src/components/desktop/apps/TerminalApp.tsx` and specified in `docs/apps/terminal-specification.md`.
- **Custom Event Synchronization**: Handled via `src/lib/wallpaper-state.ts` and governed by `docs/conventions/code-style-and-linting.md` (Section 5).

---

## 5. Governance and Contribution Model

### 5.1. Strict Invariant Verification
Before any pull request or code change is merged, contributors and automated validation runners must confirm adherence to these four critical invariants:

1. **Strict Zero Emoji Policy**: No unicode emojis or pictorial smileys in any technical documentation, code comments, or commit messages. Standard ASCII markers (`-`, `*`, `1.`, `[x]`, `[!]`) are required.
2. **Proprietary Operating Identity**: No references to third-party commercial operating system trademarks. The shell must always be referenced as RadjaShell (`radja-sh`) executing within Radja Terminal Emulator.
3. **TypeScript Strictness**: Zero tolerance for `any` leaks, unhandled `undefined` indexing, or uncleaned global event subscriptions.
4. **Tailwind Hygiene**: Utility classes must be grouped logically according to the 5-tier layout-to-transitions order.

---

## 6. Document Revision History

| Version | Release Date | Summary of Changes | Author / Reviewer |
| :--- | :--- | :--- | :--- |
| `v1.0.0` | 2026-10-03 | Initial architecture documentation baseline | RadjaOS Architecture Team |
| `v1.1.0` | 2026-10-03 | Formalized Oh My Posh prompt segmentation | RadjaOS Shell Workgroup |
| `v1.2.0` | 2026-10-03 | Enforced Zero Emoji Policy and Trademark Bans | RadjaOS Governance Board |
| `v2.0.0` | 2026-10-03 | Comprehensive 6-document technical suite release | Applications & Conventions Architect |
