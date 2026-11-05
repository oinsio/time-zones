import {
  type HourFormat,
  type Preferences,
  type ThemePreference,
  ZoneLabelPart,
} from "./preferences";

/**
 * Commands of the preferences: plain JSON (ADR-0002).
 * Implements FR4, FR5 of add-settings-page-and-device-time-location (D5);
 * SET_INTERFACE_LANGUAGE implements FR7 of add-interface-language-selection (D1);
 * SET_ZONE_LABEL_PART implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4).
 */
export enum PreferencesCommandType {
  SET_THEME = "SET_THEME",
  SET_HOUR_FORMAT = "SET_HOUR_FORMAT",
  SET_INTERFACE_LANGUAGE = "SET_INTERFACE_LANGUAGE",
  SET_ZONE_LABEL_PART = "SET_ZONE_LABEL_PART",
}

export type PreferencesCommand =
  | { type: PreferencesCommandType.SET_THEME; theme: ThemePreference }
  | { type: PreferencesCommandType.SET_HOUR_FORMAT; hourFormat: HourFormat }
  | {
      type: PreferencesCommandType.SET_INTERFACE_LANGUAGE;
      interfaceLanguage: string;
    }
  | {
      type: PreferencesCommandType.SET_ZONE_LABEL_PART;
      part: ZoneLabelPart;
      isShown: boolean;
    };

const ZONE_LABEL_PARTS_IN_ORDER: readonly ZoneLabelPart[] =
  Object.values(ZoneLabelPart);

function reduceZoneLabelPart(
  preferences: Preferences,
  part: ZoneLabelPart,
  isShown: boolean,
): Preferences {
  if (preferences.zoneLabelParts.includes(part) === isShown) return preferences;
  return {
    ...preferences,
    zoneLabelParts: ZONE_LABEL_PARTS_IN_ORDER.filter((candidate) =>
      candidate === part
        ? isShown
        : preferences.zoneLabelParts.includes(candidate),
    ),
  };
}

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
    case PreferencesCommandType.SET_INTERFACE_LANGUAGE:
      return preferences.interfaceLanguage === command.interfaceLanguage
        ? preferences
        : { ...preferences, interfaceLanguage: command.interfaceLanguage };
    case PreferencesCommandType.SET_ZONE_LABEL_PART:
      return reduceZoneLabelPart(preferences, command.part, command.isShown);
  }
}
