/**
 * Zone abbreviations whose spelling differs by interface language, as locale
 * keys; every other abbreviation is written as tzdb spells it.
 * Implements FR3 of show-zone-abbreviations-and-zone-label-setting (D3).
 */
export const LOCALIZED_ZONE_ABBREVIATION_KEYS: Readonly<
  Record<string, string>
> = { MSK: "locations.zoneAbbreviationMsk" };
