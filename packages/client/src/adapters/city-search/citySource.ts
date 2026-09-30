import type { CityRecord, CitySearchResult } from "@/ports";

/** A zone-city record as extracted from CLDR at build time (D6). */
export type ZoneCityData = {
  timeZoneId: string;
  names: { en: string; ru: string };
  countryCode: string;
};

/**
 * One source of city records (ADR-0006). Sources are queried by the composite
 * adapter with an already normalized query.
 * Implements FR2–FR4 of add-locations-via-search (D7).
 */
export interface CitySource {
  readonly records: readonly CityRecord[];
  /** Results for a normalized, non-empty query; order is not significant. */
  match(normalizedQuery: string): readonly CitySearchResult[];
}
