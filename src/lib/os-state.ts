export type AppId =
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "terminal"
  | "trash"
  | "settings";

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SESSION_KEY = "radjaos_session_timestamp";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const POTATO_KEY = "radjaos_potato_mode";

export function checkSessionValid(): { valid: boolean; expired: boolean } {
  if (typeof window === "undefined") return { valid: false, expired: false };
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return { valid: false, expired: false };

  const timestamp = parseInt(stored, 10);
  if (isNaN(timestamp)) return { valid: false, expired: false };

  const age = Date.now() - timestamp;
  if (age >= SEVEN_DAYS_MS) {
    localStorage.removeItem(SESSION_KEY);
    return { valid: false, expired: true };
  }
  return { valid: true, expired: false };
}

export function createSession() {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, Date.now().toString());
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function simulateSessionExpiry() {
  if (typeof window !== "undefined") {
    // Set timestamp to 8 days ago
    localStorage.setItem(SESSION_KEY, (Date.now() - SEVEN_DAYS_MS - 10000).toString());
  }
}

export function getPotatoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(POTATO_KEY) === "true";
}

export function setPotatoModeState(enabled: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem(POTATO_KEY, enabled ? "true" : "false");
  }
}
