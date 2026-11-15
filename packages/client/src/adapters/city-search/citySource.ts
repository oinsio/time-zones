import type { CityNameLanguage } from "@/constants";
import type { Coordinates } from "@/model";
import type { CityRecord, CitySearchResult } from "@/ports";

/** A zone-city record as extracted from CLDR at build time (D6). */
export type ZoneCityData = {
  timeZoneId: string;
  names: Record<CityNameLanguage, string>;
  countryCode: string;
  /** Absent for UTC and for a zone the zone coordinates lack. Implements FR5 of add-city-coordinates-to-locations. */
  coordinates?: Coordinates;
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

/** A GeoNames city expanded from the committed city data (design D5). */
export type GeoNamesCityEntry = {
  /** The GeoNames ID, decimal, as the record ID. */
  id: string;
  names: Record<CityNameLanguage, string>;
  countryCode: string;
  timeZoneId: string;
  population: number;
  /** Implements FR5 of add-city-coordinates-to-locations (D2). */
  coordinates: Coordinates;
  region?: Record<CityNameLanguage, string>;
};

/**
 * The GeoNames section of the search data: its cities and what it adds to the
 * zone cities.
 * Implements FR1, FR7, FR14 of add-geonames-city-source (D3, D4, D5).
 */
export type GeoNamesCityData = {
  cities: readonly GeoNamesCityEntry[];
  /** Zone ID → population of its exemplar city. */
  zoneCityPopulations: Readonly<Record<string, number>>;
  /** Zone ID → region of its exemplar city, for namesakes. */
  zoneCityRegions: Readonly<Record<string, Record<CityNameLanguage, string>>>;
};

export const EMPTY_GEONAMES_CITY_DATA: GeoNamesCityData = {
  cities: [],
  zoneCityPopulations: {},
  zoneCityRegions: {},
};
