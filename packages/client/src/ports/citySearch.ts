import type { CityNameLanguage } from "@/constants";

/** Why a result matched, best kind first (ranking follows this order). */
export enum SearchMatchKind {
  ABBREVIATION = "ABBREVIATION",
  CITY_PREFIX = "CITY_PREFIX",
  CITY_WORD_PREFIX = "CITY_WORD_PREFIX",
  COUNTRY = "COUNTRY",
  /** A popular location offered before the user types. */
  SUGGESTION = "SUGGESTION",
}

/** A place that can be added, per ADR-0006. */
export type CityRecord = {
  /**
   * Unique per city: the canonical time zone identifier for a zone city, the
   * decimal GeoNames ID for a GeoNames city.
   */
  id: string;
  timeZoneId: string;
  names: Record<CityNameLanguage, string>;
  /** ISO 3166-1 alpha-2 code; empty for zones without a country. */
  countryCode: string;
  /** Abbreviations that map to this zone. */
  aliases: readonly string[];
  /** Larger means more prominent; popular locations first. */
  rank: number;
  /** Inhabitants; 0 when unknown. Implements FR5 of add-geonames-city-source (D2). */
  population: number;
  /**
   * First-level division in each language, present for namesakes only.
   * Implements FR7 of add-geonames-city-source (D2, D4).
   */
  region?: Record<CityNameLanguage, string>;
};

/**
 * Whether a label is one of the names of the record, in any language.
 * Implements FR1 of show-city-labels-in-interface-language (D2).
 */
export const isCityNameOfRecord = (
  record: CityRecord,
  label: string,
): boolean => Object.values(record.names).includes(label);

export type CitySearchResult = {
  record: CityRecord;
  matchKind: SearchMatchKind;
  /** The abbreviation the query equalled, when matched by abbreviation. */
  matchedAbbreviation?: string;
};

/**
 * Finds places by city, country or time zone abbreviation. Synchronous once
 * loaded, so results follow typing in the same frame.
 * Implements FR1–FR7, NFR-P1 of add-locations-via-search (D7).
 */
export interface CitySearch {
  search(
    query: string,
    language: CityNameLanguage,
  ): readonly CitySearchResult[];
  /**
   * The city a time zone stands for, in the interface language; the name
   * derived from the zone ID when the data has none.
   * Implements FR8, FR12 of show-here-entry-for-device-time.
   */
  getExemplarCity(timeZoneId: string, language: CityNameLanguage): string;
  /**
   * The name a location is shown with: the name of the zone's record in the
   * language when the stored label is one of that record's names, otherwise
   * the stored label.
   * Implements FR1 of show-city-labels-in-interface-language (D2).
   */
  getCityLabel(
    timeZoneId: string,
    storedLabel: string,
    language: CityNameLanguage,
  ): string;
  /** Popular locations, shown for an empty query. */
  suggest(): readonly CitySearchResult[];
}

/** Loads the search data; rejects when it cannot be loaded (FR15). */
export type LoadCitySearch = () => Promise<CitySearch>;
