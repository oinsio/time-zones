import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadCitySearch } from "@/adapters";
import type { SupportedLanguage } from "@/i18n";
import type { Location } from "@/model";
import { type PresentedSearchResult, presentSearchResults } from "@/presenter";
import type { CitySearch, LoadCitySearch } from "@/ports";

export enum CitySearchStatus {
  LOADING = "LOADING",
  READY = "READY",
  FAILED = "FAILED",
}

/** A loaded search per loader, so reopening is instant. */
const loadedSearches = new WeakMap<LoadCitySearch, CitySearch>();

/**
 * Loads the city search data and presents its results. A failed load is not
 * cached: `retry` calls the loader again.
 * Implements FR6, FR15, NFR-P2 of add-locations-via-search (D8, D9).
 */
export function useCitySearch(load: LoadCitySearch = loadCitySearch) {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage;
  const [search, setSearch] = useState<CitySearch | undefined>(() =>
    loadedSearches.get(load),
  );
  const [isFailed, setIsFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (loadedSearches.has(load)) return;
    let isCurrent = true;
    load().then(
      (loaded) => {
        loadedSearches.set(load, loaded);
        if (isCurrent) setSearch(loaded);
      },
      () => {
        if (isCurrent) setIsFailed(true);
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => {
    setIsFailed(false);
    setAttempt((previousAttempt) => previousAttempt + 1);
  }, []);

  const presentResults = useCallback(
    (query: string, locations: readonly Location[]): PresentedSearchResult[] => {
      if (search === undefined) return [];
      const results =
        query.trim() === "" ? search.suggest() : search.search(query, language);
      return presentSearchResults(results, locations, language);
    },
    [search, language],
  );

  const status =
    search !== undefined
      ? CitySearchStatus.READY
      : isFailed
        ? CitySearchStatus.FAILED
        : CitySearchStatus.LOADING;
  return { status, presentResults, retry };
}
