# RadjaOS Architectural Anti-Patterns and Prohibitions Catalog

A definitive catalog of prohibited architectural patterns, disallowed visual paradigms, blacklisted trademarked nomenclature, and performance regressions within RadjaOS.

---

## 1. Governance and Scope

This document serves as the mandatory gatekeeper standard for RadjaOS development. Any pull request, architectural design, component submission, or documentation change introducing any anti-pattern listed below must be rejected during automated linting and peer review.

---

## 2. Category A: Prohibited Trademarked Nomenclature

RadjaOS is an independent, proprietary web desktop operating system and interactive portfolio environment. It is not an official product, fork, or sub-distribution of any commercial operating system.

### 2.1. The Blacklisted Terms Registry
The following third-party trademarked names and identifiers are strictly prohibited across all source code, comments, user-facing copy, metadata, and documentation:

| Prohibited Trademark Token | Violation Category | Mandatory RadjaOS Equivalent | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| `Windows 11` | Trademark Infringement | `RadjaOS` / `Modern Web Desktop` | RadjaOS is an autonomous desktop environment, not a commercial clone |
| `Microsoft` | Trademark Infringement | `Radja Engineering` / `RadjaOS Team` | Commercial corporation trademark with no legal affiliation |
| `PowerShell` | Trademark Infringement | `RadjaShell` (`radja-sh`) | Terminal runtime is an in-browser virtual shell, not a proprietary shell |
| `macOS` | Trademark Infringement | `Desktop Unix-like Environment` | Commercial brand name; conflicting visual and interaction paradigms |
| `Hyprland` | Trademark / Misattribution | `Radja Tiling Compositor Engine` | Linux compositor with distinct C++ native architecture |

### 2.2. Enforcement Rules
- **Rule A-01**: Never use prohibited terms in application titles, window captions, desktop icon labels, or tooltips.
- **Rule A-02**: Never reference external vendor design systems as the official owner of RadjaOS assets. All styling must be referenced as "RadjaOS Fluent Materials", "Radja Acrylic", or "Radja Mica".
- **Rule A-03**: The terminal emulator must strictly identify itself as "Radja Terminal Emulator" executing "RadjaShell (`radja-sh`)" with "Oh My Posh Styled Segments".

---

## 3. Category B: Window Frame Control Prohibitions

### 3.1. Prohibition Against macOS-Style Traffic Light Dots
- **Violation Description**: Placing three circular red, yellow, and green dots on the top-left edge of window frames.
- **Why It Is Prohibited**: RadjaOS adheres strictly to a modern centered-desktop layout with dedicated top-right caption controls. Injecting circular traffic light controls degrades visual coherence and confuses user interaction expectations.

### 3.2. Mandatory Caption Controls Specification
All window titlebars must align caption control buttons to the top-right corner using standard rectangular trigger blocks:

```
+---------------------------------------------------------------------------------+
| Window Titlebar                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [X] PROHIBITED (Top-Left Traffic Lights):                                      |
|  (O) (O) (O)  Window Title                                                      |
|   Red  Yel Grn                                                                  |
|                                                                                 |
|  [x] MANDATORY (Top-Right Caption Controls):                                    |
|  [Icon] Window Title ------------------------- [ - ]  [ [] ]  [ X ]             |
|                                                  Min    Max   Close             |
+---------------------------------------------------------------------------------+
```

#### Required Behavior of Caption Buttons
1. **Minimize Button (`-`)**:
   - Glyph: ASCII hyphen / horizontal bar or Lucide `Minus`.
   - Hover Style: `hover:bg-white/10 text-neutral-300`.
   - Action: Collapses window into the taskbar running pill.
2. **Maximize / Restore Button (`[]`)**:
   - Glyph: ASCII square brackets or Lucide `Square` / `Copy`.
   - Hover Style: `hover:bg-white/10 text-neutral-300`.
   - Action: Toggles between floating bounds and full screen workspace bounds.
3. **Close Button (`X`)**:
   - Glyph: ASCII cross or Lucide `X`.
   - Hover Style: Solid crimson `#c42b1c` (`hover:bg-[#c42b1c] text-white`).
   - Active Style: `#b22617`.
   - Action: Terminates the window session and plays `playWindowClose()`.

---

## 4. Category C: Aesthetic and Visual Prohibitions

### 4.1. Prohibition Against Generic AI Radial Glow Orbs
- **Violation Description**: Scattering saturated neon purple, cyan, or magenta radial glow orbs (`radial-gradient(circle, #a855f7 0%, transparent 70%)`) randomly behind cards or viewports.
- **Why It Is Prohibited**: Generic neon radial glows are an overused hallmark of unpolished AI templates. They reduce contrast, compromise readability, and contradict the subtle translucency of RadjaOS desktop materials.
- **Approved Alternative**: Use authentic wallpaper presets (e.g. RadjaOS Dark Bloom) or subtle backdrop-blur mica surfaces (`bg-neutral-900/80 backdrop-blur-xl border border-white/10`).

### 4.2. Prohibition Against Opaque Monolithic Cards
- **Violation Description**: Creating content boxes with solid pitch-black or grey backgrounds without borders (`bg-black` or `bg-neutral-800`).
- **Approved Alternative**: Always apply the 1px subtle stroke with translucent fill (`bg-white/[0.04] border border-white/[0.08] rounded-xl`).

---

## 5. Category D: Documentation and Codebase Emoji Prohibition

### 5.1. Strict Zero Emoji Policy
- **Violation Description**: Inserting graphical unicode emojis (e.g. smileys, rockets, fire, warning signs, checkmark emojis) into technical documentation, Markdown files, TypeScript docstrings, or commit messages.
- **Why It Is Prohibited**: Emojis undermine technical rigor, disrupt monospaced alignment in CLI tools, introduce font rendering inconsistencies across operating systems, and interfere with automated Markdown AST parsers.

### 5.2. Mandatory ASCII Alternatives

| Prohibited Emoji Pattern | Mandatory ASCII Standard |
| :--- | :--- |
| Checkmark symbol | `[x]` or `Pass` or `Verified` |
| Cross / Failure symbol | `[ ]` or `[X]` or `Fail` |
| Warning / Alert symbol | `[!]` or `WARNING:` |
| Information symbol | `[i]` or `NOTE:` |
| Rocket / Fast symbol | `*` or `PERF:` |
| Arrow symbols | `->` or `-->` or `<--` |
| Bullet points | `-` or `*` |

---

## 6. Category E: Performance and Frontend Anti-Patterns

### 6.1. Anti-Pattern: Unthrottled Pointer Event State Updates
- **Problem**: Calling `setPos({ x: e.clientX, y: e.clientY })` directly inside raw `pointermove` or `mousemove` listeners.
- **Impact**: Fires 120-240 React re-render cycles per second, causing frame drops and input lag during window drags.
- **Solution**: Throttle position tracking through `requestAnimationFrame` and mutate CSS transforms (`translate3d`) directly on the DOM element ref.

### 6.2. Anti-Pattern: Synchronous Binary Base64 Storage in LocalStorage
- **Problem**: Serializing high-resolution wallpaper images as Base64 strings and invoking `localStorage.setItem("wallpaper", base64)`.
- **Impact**: Instantly crashes browser storage when exceeding the synchronous 5MB quota and locks the main JavaScript thread during serialization.
- **Solution**: Store binary blobs in IndexedDB (`radjaos-db`) using asynchronous chunked streams.

### 6.3. Anti-Pattern: Prop Drilling Through Window Hierarchies
- **Problem**: Passing window dispatch callbacks (`openApp`, `closeApp`, `focusApp`, `toggleMinimize`) down 6 levels of child components.
- **Solution**: Use dedicated state modules, lightweight event buses, or component compound interfaces.

### 6.4. Anti-Pattern: Dangling Global Event Listeners
- **Problem**: Attaching `window.addEventListener("resize", ...)` or `window.addEventListener("pointerup", ...)` without returning a cleanup function in `useEffect`.
- **Impact**: Memory leaks and ghost event handling when windows are closed and re-opened.
- **Solution**: Always provide an explicit cleanup function removing all registered listeners.

---

## 7. Automated Linting and CI Gate Checks

To prevent anti-patterns from entering the production branch, all commits are validated against these automated checks:

```
[ Pre-Commit Hook / CI Pipeline ]
               |
               +---> [ 1. Trademark Regex Scan ] ──> Fails if banned terms detected
               |
               +---> [ 2. Unicode Emoji Scan ] ────> Fails if non-ASCII glyphs in docs
               |
               +---> [ 3. TypeScript Strict ] ─────> Fails if any implicit any or null leak
               |
               +---> [ 4. Tailwind Formatter ] ────> Fails if utility classes unorganized
```
