import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "../../lib/i18n";
import { t } from "../../lib/i18n";
import type { AppId } from "../../lib/os-state";
import { DESKTOP_APPS } from "../../data/app-manifest";
import { DesktopIcon } from "./DesktopIcon";

export const ARRANGE_ICONS_EVENT = "radjaos:arrange-icons";
const STORAGE_KEY = "radjaos.desktop.layout.v4";

const CELL_W = 92;
const CELL_H = 100;
const ORIGIN_X = 20;
const ORIGIN_Y = 10;
const TASKBAR_H = 48;

type Position = { x: number; y: number };
type Layout = Partial<Record<AppId, Position>>;

interface DesktopSurfaceProps {
  locale: Locale;
  isMobile: boolean;
  openApp: (id: AppId) => void;
}

function gridMetrics() {
  const width = typeof window === "undefined" ? 1280 : window.innerWidth;
  const height = typeof window === "undefined" ? 800 : window.innerHeight;
  const maxCol = Math.max(1, Math.floor((width - ORIGIN_X - 96) / CELL_W));
  const maxRow = Math.max(4, Math.floor((height - TASKBAR_H - ORIGIN_Y - 84) / CELL_H));
  return { maxCol, maxRow };
}

function defaultLayout(): Layout {
  const { maxRow } = gridMetrics();
  const rowsPerCol = Math.max(5, maxRow + 1);
  const next: Layout = {};
  DESKTOP_APPS.forEach((app, index) => {
    const col = Math.floor(index / rowsPerCol);
    const row = index % rowsPerCol;
    next[app.id] = {
      x: ORIGIN_X + col * CELL_W,
      y: ORIGIN_Y + row * CELL_H,
    };
  });
  return next;
}

function cellOf(position: Position) {
  return {
    col: Math.round((position.x - ORIGIN_X) / CELL_W),
    row: Math.round((position.y - ORIGIN_Y) / CELL_H),
  };
}

function findFreeCell(
  col: number,
  row: number,
  layout: Layout,
  exclude: AppId
): Position {
  const { maxRow } = gridMetrics();
  const occupied = new Set<string>();
  (Object.entries(layout) as [AppId, Position][]).forEach(([id, pos]) => {
    if (!pos || id === exclude) return;
    const cell = cellOf(pos);
    occupied.add(`${cell.col},${cell.row}`);
  });

  const clampCol = (value: number) => Math.max(0, value);
  const clampRow = (value: number) => Math.max(0, Math.min(value, maxRow));

  for (let radius = 0; radius <= 24; radius += 1) {
    for (let dc = -radius; dc <= radius; dc += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
        const c = clampCol(col + dc);
        const r = clampRow(row + dr);
        if (!occupied.has(`${c},${r}`)) {
          return { x: ORIGIN_X + c * CELL_W, y: ORIGIN_Y + r * CELL_H };
        }
      }
    }
  }
  return { x: ORIGIN_X + clampCol(col) * CELL_W, y: ORIGIN_Y + clampRow(row) * CELL_H };
}

function readAndValidateLayout(): Layout {
  if (typeof window === "undefined") return defaultLayout();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const fallback = defaultLayout();
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Layout;
    if (!parsed || typeof parsed !== "object") return fallback;

    const occupied = new Set<string>();
    const merged: Layout = {};

    DESKTOP_APPS.forEach((app) => {
      const pos = parsed[app.id];
      if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
        const cell = cellOf(pos);
        const key = `${cell.col},${cell.row}`;
        // If this cell is already occupied (duplicate/collided), reassign to free cell
        if (!occupied.has(key)) {
          occupied.add(key);
          merged[app.id] = { x: ORIGIN_X + cell.col * CELL_W, y: ORIGIN_Y + cell.row * CELL_H };
          return;
        }
      }
      // Reassign fallback / missing to free cell
      const free = findFreeCell(0, 0, merged, app.id);
      const freeCell = cellOf(free);
      occupied.add(`${freeCell.col},${freeCell.row}`);
      merged[app.id] = free;
    });

    return merged;
  } catch {
    return defaultLayout();
  }
}

export const DesktopSurface: React.FC<DesktopSurfaceProps> = ({
  locale,
  isMobile,
  openApp,
}) => {
  const [layout, setLayout] = useState<Layout>(() => readAndValidateLayout());
  const [selected, setSelected] = useState<AppId | null>(null);
  const [drag, setDrag] = useState<{ id: AppId; x: number; y: number } | null>(null);
  const dragRef = useRef<{
    id: AppId;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef<AppId | null>(null);
  const [, setViewportTick] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    const onResize = () => {
      setViewportTick((tick) => tick + 1);
    };
    const onArrange = () => {
      setLayout(defaultLayout());
      setSelected(null);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener(ARRANGE_ICONS_EVENT, onArrange);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener(ARRANGE_ICONS_EVENT, onArrange);
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, id: AppId) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const base = layout[id] ?? { x: ORIGIN_X, y: ORIGIN_Y };
      dragRef.current = {
        id,
        startX: event.clientX,
        startY: event.clientY,
        baseX: base.x,
        baseY: base.y,
        lastX: base.x,
        lastY: base.y,
        moved: false,
      };
      setSelected(id);

      const onMove = (moveEvent: PointerEvent) => {
        const state = dragRef.current;
        if (!state) return;
        const dx = moveEvent.clientX - state.startX;
        const dy = moveEvent.clientY - state.startY;
        if (!state.moved && Math.hypot(dx, dy) < 6) return;
        state.moved = true;
        state.lastX = state.baseX + dx;
        state.lastY = state.baseY + dy;
        setDrag({ id, x: state.lastX, y: state.lastY });
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        const state = dragRef.current;
        dragRef.current = null;

        if (state?.moved) {
          suppressClick.current = id;
          const cell = cellOf({ x: state.lastX, y: state.lastY });
          const target = findFreeCell(cell.col, cell.row, layout, id);
          setLayout((current) => ({ ...current, [id]: target }));
        }
        setDrag(null);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [layout]
  );

  const handleIconClick = (id: AppId) => {
    if (suppressClick.current === id) {
      suppressClick.current = null;
      return;
    }
    setSelected(id);
    openApp(id);
  };

  return (
    <>
      {/* Desktop free-placement surface (md and wider) */}
      <div
        className="absolute inset-x-0 top-0 bottom-12 z-10 hidden md:block"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}
      >
        {DESKTOP_APPS.map((app) => {
          const position = layout[app.id] ?? { x: ORIGIN_X, y: ORIGIN_Y };
          const isDragging = drag?.id === app.id;
          const left = isDragging && drag ? drag.x : position.x;
          const top = isDragging && drag ? drag.y : position.y;
          return (
            <div
              key={app.id}
              className="absolute"
              style={{
                transform: `translate3d(${left}px, ${top}px, 0)`,
                width: 90,
                zIndex: isDragging ? 30 : 10,
                transition: isDragging ? "none" : "transform 0.14s ease-out",
              }}
            >
              <DesktopIcon
                id={app.id}
                label={t(app.nameKey, locale)}
                iconSrc={app.icon}
                badge={app.badge}
                selected={selected === app.id}
                dragging={isDragging}
                onClick={() => handleIconClick(app.id)}
                onPointerDown={(event) => {
                  if (isMobile) return;
                  handlePointerDown(event, app.id);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile icon grid */}
      <div className="md:hidden absolute inset-x-0 top-0 bottom-12 z-10 overflow-y-auto px-4 pt-6 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-5 gap-x-2">
          {DESKTOP_APPS.map((app) => (
            <DesktopIcon
              key={app.id}
              id={app.id}
              label={t(app.nameKey, locale)}
              iconSrc={app.icon}
              badge={app.badge}
              onClick={() => openApp(app.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
