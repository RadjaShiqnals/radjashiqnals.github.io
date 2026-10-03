# Windows 11 & Fluent 2 Design System References

Koleksi referensi teknis dan spesifikasi visual untuk rekonstruksi otentik Windows 11 Web Desktop ("RadjaOS").

---

## 1. Official Documentation & Design Systems

### Microsoft Fluent 2 Design System
- **URL**: [https://fluent2.microsoft.design/](https://fluent2.microsoft.design/)
- **Core Insights**:
  - **Mica Material**: Bahan opak adaptif berbasis tema/wallpaper, dirancang untuk surface persisten seperti Window Chrome & App Canvas (`backdrop-filter: blur(30px) saturate(125%)`).
  - **Acrylic Material**: Bahan frosted glass dinamis untuk surface transien seperti Start Menu flyout, context menu, dan popover flyouts (`backdrop-filter: blur(40px) saturate(150%)`).
  - **Typography**: Segoe UI Variable (`Segoe UI Variable`, `Segoe UI`, `system-ui`, `-apple-system`, `sans-serif`) dengan hierarchy Display, Title, Subtitle, Body, Caption.
  - **Elevation & Radius**: 
    - Window corners: `8px` (`rounded-[8px]`).
    - Large flyouts (Start menu, Action Center): `12px` (`rounded-xl` / `12px`).
    - Tooltips & Context menu: `6px` - `8px`.
    - Inner cards: `6px`.

### Microsoft Windows App Design (WinUI 3 & DWM)
- **URL**: [https://learn.microsoft.com/windows/apps/design/](https://learn.microsoft.com/windows/apps/design/)
- **Core Insights**:
  - **Window Caption Controls**: Minimize (`―`), Maximize/Restore (`□` / `❐`), Close (`✕`).
  - **Close button behavior**: Hover background `#c42b1c` (Solid red), text color `#ffffff`.
  - **Maximize snap layouts**: Snap layout flyout hint saat hover di tombol maximize.
  - **Taskbar**: Tinggi standar `48px` (`h-12`), posisi fixed di bottom, ikon terpusat (center aligned) dengan running indicator pill di sisi bawah.

---

## 2. Open-Source Web Clones Benchmark

### BlueEdgeTechno / win11React
- **URL**: [https://github.com/blueedgetechno/win11React](https://github.com/blueedgetechno/win11React)
- **Live Demo**: [https://win11.blueedge.me/](https://win11.blueedge.me/)
- **Key Takeaways & Assets**:
  - Authentic Windows 11 Dark Bloom Wallpaper: `public/image/wallpaper/win11-dark.jpg` (305 KB)
  - Authentic Windows 11 Light Bloom Wallpaper: `public/image/wallpaper/win11-light.jpg` (396 KB)
  - Fluent Icons: `thispc.png`, `explorer.png`, `terminal.png`, `settings.png`, `bin0.png`, `bin1.png`, `vscode.png`, `edge.png`, `widget.png`, `search.png`, `home.png` (Win Start logo).
  - Taskbar structure: Icon centered pill layout, taskbar item hover highlight (`rgba(255,255,255,0.08)`), active indicator pill (`w-4 h-[3px] bg-[#60cdff]`).

---

## 3. Materials & CSS Recipes Extracted

### Acrylic Recipe (Start Menu, Context Menu, Action Center)
```css
background-color: rgba(32, 32, 32, 0.78);
backdrop-filter: blur(40px) saturate(150%);
-webkit-backdrop-filter: blur(40px) saturate(150%);
border: 1px solid rgba(255, 255, 255, 0.09);
box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.15);
border-radius: 12px;
```

### Mica Recipe (Window Background & Taskbar)
```css
background-color: rgba(28, 28, 28, 0.82);
backdrop-filter: blur(30px) saturate(125%);
-webkit-backdrop-filter: blur(30px) saturate(125%);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1);
border-radius: 8px;
```

### Caption Buttons (Window Chrome Top-Right)
- **Container**: `height: 36px - 40px`
- **Minimize & Maximize**: `width: 44px`, hover `background: rgba(255, 255, 255, 0.08)`
- **Close**: `width: 44px`, hover `background: #c42b1c`, active `background: #b22617`
