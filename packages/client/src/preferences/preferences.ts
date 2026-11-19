/**
 * Preferences: the user's settings, a pure model (ADR-0002).
 * Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5).
 * The zone label implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4).
 * The view mode implements FR3, FR4 of add-view-mode-setting-and-grid-skeleton (D1).
 * The day colouring implements FR1, FR2 of add-day-colouring-setting (D1).
 * The day palette implements FR3 of redesign-cards-grid-and-day-palettes (D2).
 */
import { DEFAULT_WORKING_HOURS, type WorkingHours } from "./workingHours";

/** Which colour theme the app uses; SYSTEM follows the system preference. */
export enum ThemePreference {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM",
}

/** How times of day are written. */
export enum HourFormat {
  H12 = "H12",
  H24 = "H24",
}

/** A part of the zone line the zone label can show; declaration order is the stored order; the display order is `ZONE_LABEL_PART_ORDER`. */
export enum ZoneLabelPart {
  UTC_OFFSET = "UTC_OFFSET",
  ZONE_ABBREVIATION = "ZONE_ABBREVIATION",
  COUNTRY = "COUNTRY",
}

/** How the day tracks and hour cells are coloured; declaration order is the stored order, the display order is `DAY_COLOURING_ORDER`. */
export enum DayColouring {
  PLAIN = "PLAIN",
  TIME_OF_DAY = "TIME_OF_DAY",
  WORKING_HOURS = "WORKING_HOURS",
}

/** Which set of colours the four day periods use in the Time of day colouring; the display order is `DAY_PALETTE_ORDER`. */
export enum DayPalette {
  VIVID = "VIVID",
  MUTED = "MUTED",
}

export type Preferences = {
  theme: ThemePreference;
  hourFormat: HourFormat;
  /** Registered locale code; `null` = not chosen, the browser decides. Implements FR7 of add-interface-language-selection (D1). */
  interfaceLanguage: string | null;
  /** Shown zone parts, in enum order without duplicates; empty shows no zone line part. Implements FR1 of add-country-to-zone-label (D1). */
  zoneLabelParts: readonly ZoneLabelPart[];
  /** Id of the chosen registered view; `null` = none chosen, Cards. Resolved against the view registry by `resolveActiveView`. */
  viewMode: string | null;
  /** How day tracks and hour cells are coloured. Implements FR1, FR2 of add-day-colouring-setting (D1). */
  dayColouring: DayColouring;
  /** The user's working hours, read in each location's local time. Implements FR6 of add-day-colouring-setting (D1). */
  workingHours: WorkingHours;
  /** The colours of the day periods in the Time of day colouring. Implements FR3 of redesign-cards-grid-and-day-palettes (D2). */
  dayPalette: DayPalette;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: ThemePreference.SYSTEM,
  hourFormat: HourFormat.H24,
  interfaceLanguage: null,
  zoneLabelParts: Object.values(ZoneLabelPart),
  viewMode: null,
  dayColouring: DayColouring.TIME_OF_DAY,
  workingHours: DEFAULT_WORKING_HOURS,
  dayPalette: DayPalette.VIVID,
};
