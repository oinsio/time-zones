// Public API of the preferences model (ADR-0002).
// Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location.
// Implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting.
export {
  type ParseStoredPreferencesResult,
  parseStoredPreferences,
} from "./parseStoredPreferences";
export {
  DayColouring,
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
// Implements FR6, FR7 of add-day-colouring-setting.
export {
  checkWorkingHours,
  DEFAULT_WORKING_HOURS,
  isWorkingHours,
  type WorkingHours,
  WorkingHoursError,
} from "./workingHours";
