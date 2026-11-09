import { createContext } from "react";
import type {
  HourFormat,
  Preferences,
  ThemePreference,
  ZoneLabelPart,
} from "@/preferences";

/** Whether the stored preferences could be read. */
export enum PreferencesStatus {
  READY = "READY",
  UNREADABLE = "UNREADABLE",
}

export type PreferencesContextValue = {
  preferences: Preferences;
  loadStatus: PreferencesStatus;
  hasSaveFailed: boolean;
  setTheme: (theme: ThemePreference) => void;
  setHourFormat: (hourFormat: HourFormat) => void;
  /** Implements FR7 of add-interface-language-selection (D1). */
  setInterfaceLanguage: (interfaceLanguage: string) => void;
  /** Implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4). */
  setZoneLabelPart: (part: ZoneLabelPart, isShown: boolean) => void;
  /** Implements FR3, FR4 of add-view-mode-setting-and-grid-skeleton (D1). */
  setViewMode: (viewMode: string) => void;
  /** Clears the stored document and returns to the defaults. */
  resetPreferences: () => void;
};

/** Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5). */
export const PreferencesContext = createContext<PreferencesContextValue | null>(
  null,
);
