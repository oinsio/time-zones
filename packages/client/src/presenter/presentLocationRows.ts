import type { SupportedLanguage } from "@/i18n";
import type { Location } from "@/model";
import { presentCountryName } from "./countryName";

export type LocationRow = {
  id: string;
  cityLabel: string;
  countryName: string;
};

/**
 * Rows of the location list: city and country name in the interface language.
 * Implements FR10, UX4 of add-locations-via-search (D9).
 */
export function presentLocationRows(
  locations: readonly Location[],
  language: SupportedLanguage,
): LocationRow[] {
  return locations.map((location) => ({
    id: location.id,
    cityLabel: location.label,
    countryName: presentCountryName(location.countryCode, language),
  }));
}
