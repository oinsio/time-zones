import zoneCities from "virtual:zone-cities";
import { createCompositeCitySearch } from "@/adapters/city-search";
import type { CityNameLanguage } from "@/constants";
import type { CitySearchResult } from "@/ports";
import { fullCityData } from "@/test/fullCityData";
import { startWorkCount } from "@/test/workCounters";

/** The query that prepares a search for querying: it normalizes every text once (D6). */
export const PREPARATION_QUERY = "a";

/**
 * The real search over the real extracted data, built once per test file and
 * prepared for search by one query, so the work counts below are per query.
 */
const citySearch = createCompositeCitySearch(zoneCities, fullCityData);
citySearch.search(PREPARATION_QUERY, "en");

/** A search built now: it reads country names at construction, so build it after changing `Intl`. */
export const buildCitySearch = () =>
  createCompositeCitySearch(zoneCities, fullCityData);

export type SearchWorld = {
  language: CityNameLanguage;
  results: readonly CitySearchResult[];
  /** Replaces the shared search, e.g. one built on an engine without `Intl.DisplayNames`. */
  citySearch?: ReturnType<typeof buildCitySearch>;
};

export const createSearchWorld = (): SearchWorld => ({
  language: "en",
  results: [],
});

export const runSearch = (world: SearchWorld, query: string) => {
  world.results = (world.citySearch ?? citySearch).search(
    query,
    world.language,
  );
};

export const openSuggestions = (world: SearchWorld) => {
  world.results = citySearch.suggest();
};

export const SAMPLE_QUERIES: readonly string[] = [
  "a",
  "new",
  "york",
  "Moscow",
  "Москва",
  "sao paulo",
  "Kazakhstan",
  "IST",
  "est",
  "qqqq",
  "Kazan",
  "Казань",
  "Springfield",
];

/** Runs one query over the full data; shared by the work-bound scenario and the benchmark. */
export const searchOnce = (query: string) => citySearch.search(query, "en");

/** Counts the work of one query over the full data. */
export const countSearchWork = (query: string) => {
  const workCount = startWorkCount();
  searchOnce(query);
  workCount.stop();
  return {
    normalizations: workCount.normalizations(),
    collators: workCount.collators(),
    countryNameFormatters: workCount.displayNames(),
  };
};

/** Counts the country-name formatters that preparing a freshly built search for search costs. */
export const countPreparationWork = () => {
  const freshSearch = buildCitySearch();
  const workCount = startWorkCount();
  freshSearch.search(PREPARATION_QUERY, "en");
  workCount.stop();
  return workCount.displayNames();
};

/** Counts the normalizations of loading a fresh search and asking one city label. */
export const countLoadingWork = (timeZoneId: string, storedLabel: string) => {
  const workCount = startWorkCount();
  buildCitySearch().getCityLabel(timeZoneId, storedLabel, "en");
  workCount.stop();
  return workCount.normalizations();
};

export const cityNamesOf = (world: SearchWorld): string[] =>
  world.results.map((result) => result.record.names[world.language]);

export const zoneIdsOf = (world: SearchWorld): string[] =>
  world.results.map((result) => result.record.timeZoneId);
