import type { Locale } from "../../lib/i18n";
import type { AppId } from "../../lib/os-state";

/** Props every hosted application receives from the desktop shell. */
export interface AppRuntime {
  locale: Locale;
  openApp: (id: AppId) => void;
  closeSelf: () => void;
  isMobile: boolean;
  potatoMode: boolean;
  setLocale: (locale: Locale) => void;
  isMuted: boolean;
  toggleMute: () => void;
  togglePotatoMode: () => void;
  onSimulateExpiry: () => void;
  onTriggerBSOD: () => void;
}
