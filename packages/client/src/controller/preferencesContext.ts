import { createContext } from "react";
import type { HourFormat, Preferences, ThemePreference } from "@/preferences";

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
  /** Clears the stored document and returns to the defaults. */
  resetPreferences: () => void;
};

/** Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5). */
export const PreferencesContext = createContext<PreferencesContextValue | null>(
  null,
);
