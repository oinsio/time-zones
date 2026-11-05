/**
 * Preferences: the user's settings, a pure model (ADR-0002).
 * Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5).
 * The zone label implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4).
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

/** A part of the zone line the zone label can show; declaration order is display order. */
export enum ZoneLabelPart {
  UTC_OFFSET = "UTC_OFFSET",
  ZONE_ABBREVIATION = "ZONE_ABBREVIATION",
}

export type Preferences = {
  theme: ThemePreference;
  hourFormat: HourFormat;
  /** Registered locale code; `null` = not chosen, the browser decides. Implements FR7 of add-interface-language-selection (D1). */
  interfaceLanguage: string | null;
  /** Shown zone parts, in enum order without duplicates; empty leaves only the country. */
  zoneLabelParts: readonly ZoneLabelPart[];
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: ThemePreference.SYSTEM,
  hourFormat: HourFormat.H24,
  interfaceLanguage: null,
  zoneLabelParts: Object.values(ZoneLabelPart),
};
