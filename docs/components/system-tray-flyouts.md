# System Tray Flyouts Component Specification

## 1. Overview and Architecture

The System Tray Flyouts subsystem (`src/components/desktop/Taskbar.tsx`) manages secondary control panels, environment telemetry, system toggles, timekeeping, and internationalization overlays inside the RadjaOS Web Desktop Environment.

The architecture comprises three specialized flyout panels:
1. **Quick Settings Flyout**: Hardware toggles (WiFi, Audio, Eco Mode) and dynamic range sliders (Volume, Brightness).
2. **Calendar and Digital Clock Flyout**: Extended date display, digital clock, interactive calendar day grid, and notification summary.
3. **Language Switcher Flyout**: Locale selection and dictionary synchronization.

All flyouts adhere to strict visual consistency standards:
- **Surface Token**: Deep Acrylic (`acrylic-surface`) with 40px backdrop blur, saturation boost, and thin 1px border (`border-white/10`).
- **Elevation**: Layer 50 (`z-index: 50`), ensuring flyouts float cleanly above all windows and the 48px Centered System Taskbar.
- **Mutual Exclusivity**: Opening any individual flyout automatically dismisses all peer flyouts.
- **Outside Interaction Trap**: Global pointer-down event capture listener unmounts active flyouts when interacting outside boundary boxes.

---

## 2. Quick Settings Flyout Specification

The Quick Settings Flyout provides rapid access to system-level switches and hardware simulation parameters.

```
+-------------------------------------------------------------------------+
| Quick Settings Flyout (360px width, bottom-14 right-3, z-index: 50)     |
|                                                                         |
|  +--------------------+ +--------------------+ +--------------------+   |
|  | [WiFi] Radja Fiber | | [Audio] Audio ON   | | [Zap] Eco (Potato) |   |
|  | (Primary Accent)   | | (Dynamic State)    | | (Amber Accent)     |   |
|  +--------------------+ +--------------------+ +--------------------+   |
|                                                                         |
|  Volume Control                                                         |
|  [Vol] [======================================------]  80%              |
|                                                                         |
|  Display Brightness                                                     |
|  [Lum] [============================================] 100%              |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | [Bat] 100% (Plugged in • Kopi SWAG Powered)            [Settings] |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

### 2.1. Coordinate Positioning and Dimensions
- **Position**: `fixed bottom-14 right-3` (anchored 56px above bottom taskbar, 12px from right viewport edge).
- **Dimensions**: Fixed 360px desktop width, clamped to `max-w-[95vw]` on mobile.
- **Surface**: `rounded-2xl acrylic-surface p-4 z-50 shadow-2xl animate-win-flyout text-white select-none border border-white/10 space-y-4`.

### 2.2. Hardware Toggles Grid
Organized in a 3-column layout (`grid grid-cols-3 gap-2`):
1. **WiFi Network Toggle**:
   - Status: Active connection indicator ("Radja Fiber").
   - Token: Primary accent blue (`bg-blue-600 text-white`).
2. **Audio Mute Toggle**:
   - Status: Dynamic state display ("Audio ON" vs "Muted").
   - Handler: Dispatches `toggleMute()`.
   - Visual: Switches between `bg-blue-600 text-white` (unmuted) and `bg-white/5 text-neutral-400` (muted).
3. **Eco Mode (Potato Mode) Toggle**:
   - Status: Displays active graphic profile ("Eco (Potato)" vs "Glass GPU").
   - Handler: Dispatches `togglePotatoMode()`.
   - Visual: Switches between `bg-amber-600 text-white` (Eco Mode active) and `bg-white/5 text-neutral-400` (Glass GPU active).

### 2.3. Range Slider Controls
The flyout incorporates real-time dual range sliders:

#### Master Volume Slider
```tsx
<div className="flex items-center gap-3">
  <button onClick={toggleMute} className="text-neutral-300 hover:text-white cursor-pointer">
    {isMuted || volumeLevel === 0 ? (
      <VolumeX className="w-4 h-4" />
    ) : (
      <Volume2 className="w-4 h-4 text-blue-400" />
    )}
  </button>
  <input
    type="range"
    min="0"
    max="100"
    value={isMuted ? 0 : volumeLevel}
    onChange={(e) => {
      setVolumeLevel(parseInt(e.target.value, 10));
      if (isMuted) toggleMute();
    }}
    className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-full"
  />
  <span className="font-mono text-xs text-neutral-400 w-8 text-right">
    {isMuted ? 0 : volumeLevel}%
  </span>
</div>
```

#### Display Brightness Slider
```tsx
<div className="flex items-center gap-3">
  <Sparkles className="w-4 h-4 text-amber-400" />
  <input
    type="range"
    min="20"
    max="100"
    value={brightnessLevel}
    onChange={(e) => setBrightnessLevel(parseInt(e.target.value, 10))}
    className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-full"
  />
  <span className="font-mono text-xs text-neutral-400 w-8 text-right">
    {brightnessLevel}%
  </span>
</div>
```

### 2.4. Telemetry Footer
- **Power Telemetry**: Reports battery level (`100% Plugged in`) and satirical energy source designation (`Kopi SWAG Powered`).
- **Deep Link Navigation**: Direct shortcut button navigating into the system Settings application window.

---

## 3. Calendar and Digital Clock Flyout Specification

The Calendar and Digital Clock Flyout presents temporal context, calendar day matrix, and notification focus telemetry.

```
+-------------------------------------------------------------------------+
| Calendar and Clock Flyout (340px width, bottom-14 right-3, z-index: 50) |
|                                                                         |
|  Friday, October 3                                                      |
|  11:42:15 PM                                                            |
|  ---------------------------------------------------------------------  |
|   Su   Mo   Tu   We   Th   Fr   Sa                                      |
|    1    2    3    4    5    6    7                                      |
|    8    9   10   11   12   13   14                                      |
|   15   16   17  [18]  19   20   21   <- [18] Active Day Highlight       |
|   22   23   24   25   26   27   28                                      |
|   29   30   31                                                          |
|  ---------------------------------------------------------------------  |
|  [Bell] No unread notifications                              Focus: ON  |
+-------------------------------------------------------------------------+
```

### 3.1. Header Temporal Typography
- **Weekday and Month**: Formatted using `toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })` in 14px bold white typography.
- **Large Digital Clock**: Real-time 24px light-weight readout (`text-2xl font-light text-neutral-200 mt-1`) updated at 1-second intervals.

### 3.2. 7-Column Day Grid Architecture
The calendar renders standard 7-column day headers (`Su` through `Sa`) followed by a 31-day numeric matrix:

```tsx
<div className="grid grid-cols-7 gap-1 text-center text-xs">
  {Array.from({ length: 31 }).map((_, i) => {
    const day = i + 1;
    const isToday = day === new Date().getDate();
    return (
      <div
        key={day}
        className={`h-7 flex items-center justify-center rounded-full text-xs transition-colors ${
          isToday
            ? "bg-blue-600 text-white font-bold ring-2 ring-blue-400/40"
            : "text-neutral-300 hover:bg-white/10 cursor-pointer"
        }`}
      >
        {day}
      </div>
    );
  })}
</div>
```

- Current date receives a solid blue pill badge with accent ring highlight (`bg-blue-600 text-white font-bold ring-2 ring-blue-400/40`).
- Adjacent days display translucent hover indicators (`hover:bg-white/10`).

### 3.3. Notification Panel Footer
- Summarizes system notification queue ("No unread notifications").
- Reports focus session status ("Focus: ON").

---

## 4. Language Switcher Flyout Specification

The Language Switcher Flyout enables immediate dictionary switching across the three officially supported RadjaOS locales: English (`en`), Indonesian (`id`), and Japanese (`ja`).

```
+---------------------------------------------------------------+
| Language Switcher Flyout (176px width, bottom-14 right-28)    |
|                                                               |
|  +---------------------------------------------------------+  |
|  | English                                            [US] |  |
|  | (Selected Pill: bg-blue-600/30 border-blue-500/40)      |  |
|  +---------------------------------------------------------+  |
|  | Indonesia                                          [ID] |  |
|  +---------------------------------------------------------+  |
|  | Japanese                                           [JP] |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### 4.1. Coordinate Positioning and Anchoring
- **Position**: `fixed bottom-14 right-28` (anchored directly above the taskbar's language code pill).
- **Dimensions**: Width 176px (`w-44`), rounded-xl (`12px`).
- **Animation**: Entrance driven by scale-fade keyframes (`animate-win-zoom`).

### 4.2. Selection State Mapping
```tsx
{(Object.keys(localeNames) as Locale[]).map((loc) => (
  <button
    key={loc}
    onClick={() => {
      setLocale(loc);
      setIsLangMenuOpen(false);
    }}
    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
      locale === loc
        ? "bg-blue-600/30 text-white font-bold border border-blue-500/40"
        : "hover:bg-white/10 text-neutral-300 hover:text-white"
    }`}
  >
    <span>{localeNames[loc].label}</span>
    <span className="text-base">{localeNames[loc].flag}</span>
  </button>
))}
```

- Clicking any locale triggers `setLocale(loc)`, updating the reactive dictionary in memory, persisting the preference to `localStorage.setItem("radjaos_locale", loc)`, and instantly dismissing the flyout.

---

## 5. Event Handling and Dismissal Invariants

1. **Escape Key Handling**: Pressing Escape while any flyout is focused immediately dismisses all open flyouts.
2. **Mutual Exclusion Principle**: Triggering the Quick Settings button automatically sets `isStartOpen(false)` and `isCalendarOpen(false)`.
3. **Passive Interaction Guard**: Slider drags do not trigger window hover-focus or desktop selection events while scrubbing.
