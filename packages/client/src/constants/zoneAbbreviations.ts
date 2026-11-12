/**
 * Zone abbreviations whose spelling differs by interface language, as locale
 * keys; every other abbreviation is written as tzdb spells it.
 * Implements FR3 of show-zone-abbreviations-and-zone-label-setting (D3).
 */
export const LOCALIZED_ZONE_ABBREVIATION_KEYS: Readonly<
  Record<string, string>
> = { MSK: "locations.zoneAbbreviationMsk" };

/** A tzdb designation counts as an abbreviation only when it is letters alone. */
export const LETTERS_ONLY_DESIGNATION = /^[A-Za-z]+$/;

/** The prefix of a zone name written from the offset, such as `GMT+5`. */
export const GMT_ZONE_NAME_PREFIX = "GMT";
