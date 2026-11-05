// Public API of the preferences model (ADR-0002).
// Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location.
// Implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting.
export {
  type ParseStoredPreferencesResult,
  parseStoredPreferences,
} from "./parseStoredPreferences";
export {
  DEFAULT_PREFERENCES,
  HourFormat,
  type Preferences,
  ThemePreference,
  ZoneLabelPart,
} from "./preferences";
export {
  type PreferencesCommand,
  PreferencesCommandType,
  reducePreferences,
} from "./preferencesCommands";
