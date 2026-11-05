import type { TFunction } from "i18next";
import { LOCALIZED_ZONE_ABBREVIATION_KEYS } from "@/constants";

/**
 * The text of a zone abbreviation in the interface language: tzdb's Latin
 * letters, except for the abbreviations the locale files spell out (`MSK`).
 * Implements FR3 of show-zone-abbreviations-and-zone-label-setting (D3).
 */
export function formatZoneAbbreviation(
  abbreviation: string,
  translate: TFunction,
): string {
  const localizedKey = LOCALIZED_ZONE_ABBREVIATION_KEYS[abbreviation];
  return localizedKey === undefined ? abbreviation : translate(localizedKey);
}
