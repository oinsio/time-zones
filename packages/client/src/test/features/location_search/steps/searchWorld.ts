import zoneCities from "virtual:zone-cities";
import { createCompositeCitySearch } from "@/adapters/city-search";
import type { SupportedLanguage } from "@/i18n";
import type { CitySearchResult } from "@/ports";
import { startWorkCount } from "@/test/workCounters";

/** The real search over the real extracted data, built once per test file. */
const citySearch = createCompositeCitySearch(zoneCities);

/** A search built now: it reads country names at construction, so build it after changing `Intl`. */
export const buildCitySearch = () => createCompositeCitySearch(zoneCities);

export type SearchWorld = {
  language: SupportedLanguage;
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
  };
};

export const cityNamesOf = (world: SearchWorld): string[] =>
  world.results.map((result) => result.record.names[world.language]);

export const zoneIdsOf = (world: SearchWorld): string[] =>
  world.results.map((result) => result.record.timeZoneId);
