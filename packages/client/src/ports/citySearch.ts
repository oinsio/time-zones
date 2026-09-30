import type { SupportedLanguage } from "@/i18n";

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
  /** The canonical time zone identifier. */
  id: string;
  timeZoneId: string;
  names: Record<SupportedLanguage, string>;
  /** ISO 3166-1 alpha-2 code; empty for zones without a country. */
  countryCode: string;
  /** Abbreviations that map to this zone. */
  aliases: readonly string[];
  /** Larger means more prominent; popular locations first. */
  rank: number;
};

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
    language: SupportedLanguage,
  ): readonly CitySearchResult[];
  /** Popular locations, shown for an empty query. */
  suggest(): readonly CitySearchResult[];
}

/** Loads the search data; rejects when it cannot be loaded (FR15). */
export type LoadCitySearch = () => Promise<CitySearch>;
