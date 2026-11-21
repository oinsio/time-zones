import { createContext } from "react";
import type {
  DayColouring,
  DayPalette,
  HourFormat,
  Preferences,
  ThemePreference,
  WorkingHours,
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
  /** Implements FR1, FR3 of add-day-colouring-setting (D1). */
  setDayColouring: (dayColouring: DayColouring) => void;
  /** Implements FR3, FR4 of redesign-cards-grid-and-day-palettes (D2). */
  setDayPalette: (dayPalette: DayPalette) => void;
  /** Implements FR6, FR7 of add-day-colouring-setting (D1). */
  setWorkingHours: (workingHours: WorkingHours) => void;
  /** Implements FR5 of add-meeting-share-dialog (D4): `null` removes the pin. */
  setShareLanguage: (shareLanguage: string | null) => void;
  /** Implements FR6 of add-meeting-share-dialog (D4). */
  toggleShareZoneLabelPart: (part: ZoneLabelPart) => void;
  /** Clears the stored document and returns to the defaults. */
  resetPreferences: () => void;
};

/** Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5). */
export const PreferencesContext = createContext<PreferencesContextValue | null>(
  null,
);
