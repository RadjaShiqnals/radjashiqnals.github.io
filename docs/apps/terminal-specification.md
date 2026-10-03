# Radja Terminal Emulator: Architecture and Specification

Technical specification for the Radja Terminal Emulator, RadjaShell (`radja-sh`), command parsing pipeline, and user interface design system within RadjaOS.

---

## 1. System Architecture Overview

The Radja Terminal Emulator is an in-browser virtual terminal subsystem designed to execute commands, surface system telemetry, inspect project repositories, and interface with the RadjaOS desktop window manager. The architecture adheres to a decoupled model separating user input capture, command stream tokenization, AST dispatch, virtual execution, and terminal screen output buffering.

```
+---------------------------------------------------------------------------------+
|                           Radja Terminal Emulator                               |
+---------------------------------------------------------------------------------+
| [Tab Bar]  [Tab 1: radja-sh] [Tab 2: sysinfo] [+]                          [-] |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [Output Buffer Viewport]                                                       |
|  +---------------------------------------------------------------------------+  |
|  | RadjaOS Kernel v4.0.0-cachyos-x86_64                                      |  |
|  | Type 'help' to view available system commands.                            |  |
|  |                                                                           |  |
|  | [ radja-sh ] - [ ~\RadjaOS ] - [ git:(main) ]                             |  |
|  | radja@radjaos:~# sysinfo                                                  |  |
|  | ... [System Telemetry Block] ...                                          |  |
|  +---------------------------------------------------------------------------+  |
|                                                                                 |
|  [Suggestions Bar] [help] [fetch] [projects] [clear] [sudo] [mommy]            |
|                                                                                 |
|  [Input Stream Engine]                                                          |
|  [ radja-sh ] - [ ~\RadjaOS ] - [ git:(main) ]                                  |
|  radja@radjaos:~# |<-- Active Caret Buffer                                      |
+---------------------------------------------------------------------------------+
```

### Component Hierarchy

```
WindowFrame (id: "terminal")
  |
  +-- TerminalContainer (Dark acrylic canvas, font-mono, text-xs)
        |
        +-- TabBarController (Multi-tab management, status indicators)
        |
        +-- OutputViewport (Virtual scroll, historical entries, React nodes)
        |     |
        |     +-- StreamHistoryItem (Timestamp, command line, rendered node)
        |
        +-- SuggestionStrip (Interactive command chips for pointer navigation)
        |
        +-- PromptLine (Segmented prompt engine + input controller)
              |
              +-- PoshSegments ([ radja-sh ] - [ path ] - [ git ])
              |
              +-- CommandInput (Ref-focused HTMLInputElement, autocomplete)
```

---

## 2. Multi-Tab Bar Specification

The terminal interface incorporates a modern tabbed navigation strip situated along the upper edge of the terminal frame, directly beneath the window caption controls.

### Visual and Dimensional Specifications

| Property | Value | Tailwind / CSS Utility | Description |
| :--- | :--- | :--- | :--- |
| Bar Height | `36px` | `h-9` | Fixed vertical extent of tab container |
| Tab Height | `30px` | `h-[30px]` | Height of individual tab capsule |
| Tab Min Width | `140px` | `min-w-[140px]` | Minimum horizontal threshold before truncation |
| Tab Max Width | `220px` | `max-w-[220px]` | Maximum horizontal span for any single tab |
| Surface Material | Acrylic Dark | `bg-neutral-900/80 backdrop-blur-md` | Glassmorphic background blur |
| Active Tab Surface | Solid Mica | `bg-neutral-950/90 border-t-2 border-blue-500` | High-contrast visual focus |
| Inactive Tab Surface | Translucent | `bg-neutral-900/40 hover:bg-neutral-800/60` | Subtle background idle state |
| Active Text Color | Pure White | `text-neutral-100 font-medium` | High legibility foreground |
| Inactive Text Color | Muted Silver | `text-neutral-400 hover:text-neutral-200` | Subdued label state |
| Close Button Glyph | ASCII Cross | `text-xs px-1 hover:bg-white/10 rounded` | Tab dismissal trigger |
| Add Tab Button | ASCII Plus | `w-7 h-7 flex items-center justify-center` | Spawns new `radja-sh` session |

### Tab Lifecycle States

1. **Active**: The currently rendered shell context. Exhibits an accent indicator border along the top edge (`#0078d4`), opaque backdrop (`rgba(10, 10, 10, 0.95)`), and active cursor focus.
2. **Inactive**: Background sessions preserving buffer state without active keyboard input.
3. **Hover**: Visual highlight on mouse hover (`rgba(255, 255, 255, 0.06)`).
4. **Closing**: Transition state triggered when clicking the tab close control or executing `exit`.

---

## 3. Oh My Posh Styled Prompt Segmentation

RadjaShell utilizes a segmented prompt architecture inspired by modern CLI powerline engines. The prompt is composed of three interconnected visual blocks followed by an interactive cursor line.

### Segment Anatomy

The primary prompt format:

```
[ radja-sh ] ─ [ ~\RadjaOS ] ─ [ git:(main) ]
radja@radjaos:~# 
```

### Segment Breakdown

#### Segment 1: Shell Identifier
- **Label**: `radja-sh`
- **Text Color**: `#34d399` (Emerald 400)
- **Background Fill**: `rgba(16, 185, 129, 0.12)` (Emerald 500 at 12% opacity)
- **Border**: `1px solid rgba(16, 185, 129, 0.3)`
- **Border Radius**: `4px`
- **Purpose**: Confirms the execution engine identity (RadjaShell).

#### Connector Glyph
- **Character**: ASCII horizontal rule `─` (`\u2500`) or standard hyphen `-`
- **Color**: `#525252` (Neutral 600)
- **Padding**: `px-1`

#### Segment 2: Working Directory
- **Label**: `~\RadjaOS` (or current simulated path)
- **Text Color**: `#60a5fa` (Blue 400)
- **Background Fill**: `rgba(59, 130, 246, 0.12)` (Blue 500 at 12% opacity)
- **Border**: `1px solid rgba(59, 130, 246, 0.3)`
- **Border Radius**: `4px`
- **Purpose**: Displays virtual current working directory path.

#### Connector Glyph
- **Character**: ASCII horizontal rule `─` (`\u2500`)
- **Color**: `#525252` (Neutral 600)

#### Segment 3: Version Control Status
- **Label**: `git:(main)`
- **Text Color**: `#fbbf24` (Amber 400)
- **Background Fill**: `rgba(245, 158, 11, 0.12)` (Amber 500 at 12% opacity)
- **Border**: `1px solid rgba(245, 158, 11, 0.3)`
- **Border Radius**: `4px`
- **Purpose**: Indicates simulated repository branch and clean working tree.

#### Execution Line Prompt
```
radja@radjaos:~# <input>
```
- Host Token: `radja@radjaos` in `#34d399` (Emerald bold).
- Separator: ` : ` in `#94a3b8` (Slate 400).
- Path Token: `~# ` in `#60a5fa` (Blue bold) for root simulation or `~$ ` for standard user.

---

## 4. System Telemetry Specification ('fetch' / 'neofetch' / 'sysinfo')

Executing `fetch`, `neofetch`, or `sysinfo` generates a dual-column layout containing the RadjaOS geometric ASCII glyph alongside formal hardware and system telemetry metrics.

### ASCII Geometric Glyph

The left column displays the authentic RadjaOS 4-tile geometric ASCII emblem:

```
+-------+-------+
|       |       |
|  [R]  |  [A]  |
|       |       |
+-------+-------+
|       |       |
|  [D]  |  [J]  |
|       |       |
+-------+-------+
```

Alternative high-density block rendering:

```
######  ######
######  ######
######  ######

######  ######
######  ######
######  ######
```

### Telemetry Data Matrix

| Field | Value | Style Token | Description |
| :--- | :--- | :--- | :--- |
| User@Host | `radja@radjaos-pro` | White Bold (`#ffffff`) | Active user credentials |
| Separator | `----------------------` | Muted Gray (`#737373`) | Horizontal divider |
| OS | `RadjaOS Desktop Pro x86_64` | Cyan Accent (`#38bdf8`) | Operating system distribution |
| Edition | `Web Desktop Runtime v4.2` | Neutral Text (`#d4d4d4`) | Platform release version |
| Host | `SIDIGS Engineering Workstation` | Neutral Text (`#d4d4d4`) | Target machine profile |
| Kernel | `6.13.0-radjaos-zen` | Neutral Text (`#d4d4d4`) | Monolithic kernel build |
| Architecture | `x86_64 (Wasm/V8 Virtualized)` | Neutral Text (`#d4d4d4`) | Instruction set architecture |
| Uptime | `20 Years in production` | Emerald Accent (`#34d399`) | System lifespan counter |
| Shell | `RadjaShell (radja-sh) v4.2.0` | Blue Accent (`#60a5fa`) | Active interactive shell |
| Compositor | `Radja Desktop Window Manager (DWM)` | Blue Accent (`#60a5fa`) | Desktop presentation manager |
| Resolution | `1920x1080 @ 144Hz WebGL Canvas` | Neutral Text (`#d4d4d4`) | Active frame dimensions |
| CPU | `Radja Virtual Octa-Core @ 4.20 GHz` | Amber Accent (`#fbbf24`) | Processing unit simulation |
| GPU | `Radja Neural Accelerator (4GB VRAM)` | Amber Accent (`#fbbf24`) | Discrete graphics device |
| Memory | `3840MiB / 4096MiB (93% node_modules)` | Rose Accent (`#fb7185`) | Simulated RAM utilization |
| Palette | `[0] [1] [2] [3] [4] [5] [6] [7]` | ANSI Swatches | Terminal color capability test |

---

## 5. Supported Commands Catalog

RadjaShell supports a curated suite of commands addressing system status, application routing, shell maintenance, and humor.

### Command Reference Table

| Command | Aliases | Arguments | Output Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `help` | `?`, `man` | `[command]` | Structured Grid | Displays command directory and descriptions |
| `fetch` | `neofetch`, `sysinfo`, `fastfetch` | None | Dual Column Card | Surfaces system specs with ASCII emblem |
| `projects` | `portfolio`, `work` | None | Event Bus Trigger | Launches the Projects application window |
| `clear` | `cls`, `reset` | None | State Reset | Empties terminal buffer without losing history |
| `ls` | `dir` | `[-l] [-a] [path]` | File List Grid | Lists virtual filesystem contents |
| `sudo` | `su` | `<command>` | Satirical Warning | Mock privilege escalation failure notice |
| `mommy` | `mommy asmr`, `comfort` | None | Formatted Card | Displays supportive encouragement quotes |
| `rm -rf /` | `sudo rm -rf /` | None | Panic Trigger | Simulates critical system error and BSOD |
| `whoami` | `user` | None | Inline String | Prints authenticated user identity |
| `uptime` | None | None | Inline String | Displays time since initial boot |
| `history` | None | None | Numbered List | Lists previously entered commands |
| `theme` | `potato` | `[dark\|light\|potato]` | Status Message | Adjusts system rendering mode |

### Command Specifications

#### 1. `help`
- **Invocation**: `help` or `help <cmd>`
- **Behavior**: Iterates over internal command registry. Returns structured two-column layout with command names highlighted in `#34d399` and functional descriptions in `#a3a3a3`.

#### 2. `fetch` / `neofetch` / `sysinfo`
- **Invocation**: `fetch`
- **Behavior**: Compiles host telemetry into a structured JSX node. Binds the 4-tile ASCII emblem on viewports greater than 640px; stacks vertically on mobile viewports.

#### 3. `projects`
- **Invocation**: `projects`
- **Behavior**: Emits `app:open` event targeting `projects`. Echoes confirmation string `Launching Projects application...` to the terminal buffer.

#### 4. `clear` / `cls`
- **Invocation**: `clear`
- **Behavior**: Sets terminal output history array to an empty array `[]`. Does not clear historical command input stack (`inputHistory`).

#### 5. `ls` / `dir`
- **Invocation**: `ls` or `ls -la`
- **Behavior**: Returns simulated directory structure for `/home/radja`:
  - `drwxr-xr-x radja radja  4096 .`
  - `drwxr-xr-x radja radja  4096 ..`
  - `drwxr-xr-x radja radja  4096 projects/`
  - `drwxr-xr-x radja radja  4096 skills/`
  - `drwxr-xr-x radja radja  4096 experience/`
  - `-rw-r--r-- radja radja  1337 resume.pdf`
  - `-rwxr-xr-x radja radja 65536 mommyscript.sh`

#### 6. `sudo`
- **Invocation**: `sudo <args>`
- **Behavior**: Renders simulated credential prompt followed by authorization failure:
  ```
  [sudo] password for radja: **********
  radja is not in the sudoers file. This incident will be reported to Mommy.
  ```

#### 7. `mommy`
- **Invocation**: `mommy`
- **Behavior**: Queries localized quote repository via `getRandomMommyQuote(locale)`. Renders a soft-hued container (`bg-pink-950/40 border-pink-500/30 text-pink-200`) providing affirmative reinforcement.

#### 8. `rm -rf /`
- **Invocation**: `rm -rf /` or `sudo rm -rf /`
- **Behavior**: Executes `playErrorBeep()`, followed by invoking `onTriggerBSOD()`. Causes desktop environment to enter kernel panic screen.

---

## 6. TypeScript Architecture and Interfaces

```typescript
// Core Command Execution Types
export type TerminalExitCode = 0 | 1 | 127 | 130;

export interface ICommandDefinition {
  name: string;
  aliases?: string[];
  description: string;
  category: "system" | "navigation" | "utilities" | "easter-egg";
  usage?: string;
  execute: (context: ICommandExecutionContext) => Promise<ICommandResult> | ICommandResult;
}

export interface ICommandExecutionContext {
  rawInput: string;
  command: string;
  args: string[];
  flags: Record<string, boolean | string>;
  locale: "en" | "id" | "jp";
  actions: {
    openApp: (appId: string) => void;
    triggerBSOD: () => void;
    clearBuffer: () => void;
    playSound: (soundKey: string) => void;
  };
}

export interface ICommandResult {
  exitCode: TerminalExitCode;
  outputNode: React.ReactNode;
}

export interface ITerminalHistoryEntry {
  id: string;
  timestamp: number;
  command: string;
  output: React.ReactNode;
  exitCode: TerminalExitCode;
}

export interface ITerminalTab {
  id: string;
  title: string;
  history: ITerminalHistoryEntry[];
  currentInput: string;
  workingDirectory: string;
  gitBranch: string;
  isActive: boolean;
}

export interface ITerminalState {
  tabs: ITerminalTab[];
  activeTabId: string;
  globalHistoryIndex: number;
  commandStack: string[];
}
```

---

## 7. Command Parser Pipeline

The input parsing engine processes raw text using a four-stage synchronous pipeline:

```
[ Raw User String ] 
       |
       v
[ 1. Sanitizer & Lexer ] -----> Tokenizes whitespace and quotes ("foo bar" -> single token)
       |
       v
[ 2. AST Normalizer ] --------> Extracts primary command, positional args, and flags (--foo, -f)
       |
       v
[ 3. Dispatch Router ] -------> Matches command against ICommandDefinition registry
       |
       v
[ 4. Output Renderer ] -------> Renders ReactNode stream and updates scroll viewport
```

### Parsing Pipeline Rules

1. **Whitespace Trimming**: Leading and trailing whitespace characters are stripped before processing.
2. **Case Insensitivity for Commands**: Command names and aliases match case-insensitively (`HELP`, `Help`, `help` map to the same handler).
3. **Preservation of Argument Casing**: Arguments and string literals retain their original casing.
4. **Command Stack History**: Non-empty commands are prepended to the command history array (`commandStack`) for retrieval via the Up/Down arrow keys.
5. **Autoscroll Behavior**: Upon history modification, the terminal triggers a smooth scroll to the bottom anchor element via `scrollIntoView({ behavior: "smooth" })`.

---

## 8. Testing and Quality Assurance Matrix

| Test ID | Target Component | Input Condition | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `TEST-TERM-01` | Tab Controller | Click `+` new tab button | Spawns tab with unique session ID; focuses prompt | Verified |
| `TEST-TERM-02` | Command Router | Input: `help` | Outputs structured command list with zero layout shift | Verified |
| `TEST-TERM-03` | Sysinfo Engine | Input: `sysinfo` | Renders ASCII 4-tile emblem and hardware specs | Verified |
| `TEST-TERM-04` | Event Dispatch | Input: `projects` | Dispatches `app:open` event; projects window opens | Verified |
| `TEST-TERM-05` | Buffer Control | Input: `clear` | Empties output DOM nodes; resets scroll position | Verified |
| `TEST-TERM-06` | Panic Handler | Input: `rm -rf /` | Plays error audio tone; triggers desktop BSOD | Verified |
| `TEST-TERM-07` | History Nav | Key: `ArrowUp` | Populates input buffer with immediate prior command | Verified |
| `TEST-TERM-08` | Autocomplete | Click suggestion chip | Executes selected command immediately | Verified |
