/**
 * Preferences: the user's settings, a pure model (ADR-0002).
 * Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5).
 */

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

export type Preferences = {
  theme: ThemePreference;
  hourFormat: HourFormat;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: ThemePreference.SYSTEM,
  hourFormat: HourFormat.H24,
};
