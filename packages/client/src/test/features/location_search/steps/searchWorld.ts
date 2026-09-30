import zoneCities from "virtual:zone-cities";
import { createCompositeCitySearch } from "@/adapters/city-search";
import type { SupportedLanguage } from "@/i18n";
import type { CitySearchResult } from "@/ports";

/** The real search over the real extracted data, built once per test file. */
const citySearch = createCompositeCitySearch(zoneCities);

export type SearchWorld = {
  language: SupportedLanguage;
  results: readonly CitySearchResult[];
};

export const createSearchWorld = (): SearchWorld => ({
  language: "en",
  results: [],
});

export const runSearch = (world: SearchWorld, query: string) => {
  world.results = citySearch.search(query, world.language);
};

export const openSuggestions = (world: SearchWorld) => {
  world.results = citySearch.suggest();
};

export const measureSearchMilliseconds = (query: string): number => {
  const startedAt = performance.now();
  citySearch.search(query, "en");
  return performance.now() - startedAt;
};

export const cityNamesOf = (world: SearchWorld): string[] =>
  world.results.map((result) => result.record.names[world.language]);

export const zoneIdsOf = (world: SearchWorld): string[] =>
  world.results.map((result) => result.record.timeZoneId);
