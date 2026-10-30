import type { HourFormat, Preferences, ThemePreference } from "./preferences";

/**
 * Commands of the preferences: plain JSON (ADR-0002).
 * Implements FR4, FR5 of add-settings-page-and-device-time-location (D5).
 */
export enum PreferencesCommandType {
  SET_THEME = "SET_THEME",
  SET_HOUR_FORMAT = "SET_HOUR_FORMAT",
}

export type PreferencesCommand =
  | { type: PreferencesCommandType.SET_THEME; theme: ThemePreference }
  | { type: PreferencesCommandType.SET_HOUR_FORMAT; hourFormat: HourFormat };

/** Applies a command; an unchanged value returns the same object. */
export function reducePreferences(
  preferences: Preferences,
  command: PreferencesCommand,
): Preferences {
  switch (command.type) {
    case PreferencesCommandType.SET_THEME:
      return preferences.theme === command.theme
        ? preferences
        : { ...preferences, theme: command.theme };
    case PreferencesCommandType.SET_HOUR_FORMAT:
      return preferences.hourFormat === command.hourFormat
        ? preferences
        : { ...preferences, hourFormat: command.hourFormat };
  }
}
