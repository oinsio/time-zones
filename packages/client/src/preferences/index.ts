// Public API of the preferences model (ADR-0002).
// Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location.
export {
  type ParseStoredPreferencesResult,
  parseStoredPreferences,
} from "./parseStoredPreferences";
export {
  DEFAULT_PREFERENCES,
  HourFormat,
  type Preferences,
  ThemePreference,
} from "./preferences";
export {
  type PreferencesCommand,
  PreferencesCommandType,
  reducePreferences,
} from "./preferencesCommands";
