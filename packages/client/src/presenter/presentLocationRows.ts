import type { TFunction } from "i18next";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
import { getUtcOffsetMinutes, type Location } from "@/model";
import { presentCountryName } from "./countryName";
import { formatUtcOffset } from "./utcOffset";

export type LocationRow = {
  id: string;
  cityLabel: string;
  countryName: string;
  /** "UTC+3" style label; empty when the offset cannot be computed. */
  utcOffsetLabel: string;
};

export type LocationRowsContext = {
  language: SupportedLanguage;
  instant: Temporal.Instant;
  translate: TFunction;
};

/**
 * Rows of the location list: city, country name in the interface language and
 * the UTC offset at the given instant.
 * Implements FR10, UX4 of add-locations-via-search (D9).
 * Implements FR2, FR3, FR5, FR6 of show-utc-offset-on-location-rows (D2).
 */
export function presentLocationRows(
  locations: readonly Location[],
  { language, instant, translate }: LocationRowsContext,
): LocationRow[] {
  const utcPrefix = translate("locations.utcOffsetPrefix");
  return locations.map((location) => {
    const offsetMinutes = getUtcOffsetMinutes(location.timeZoneId, instant);
    return {
      id: location.id,
      cityLabel: location.label,
      countryName: presentCountryName(location.countryCode, language),
      utcOffsetLabel:
        offsetMinutes === undefined
          ? ""
          : formatUtcOffset(offsetMinutes, utcPrefix),
    };
  });
}
