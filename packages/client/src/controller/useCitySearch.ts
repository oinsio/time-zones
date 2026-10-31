import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  loadCitySearch,
  normalizeSearchText,
  splitIntoWords,
} from "@/adapters";
import type { SupportedLanguage } from "@/i18n";
import { isDeviceTimeLocation, type Location } from "@/model";
import type { CitySearch, LoadCitySearch } from "@/ports";
import {
  type PresentedSearchResult,
  presentDeviceTimeOptionLabels,
  presentSearchResults,
} from "@/presenter";
import { loadCitySearchOnce, readLoadedCitySearch } from "./cityDataCache";

export enum CitySearchStatus {
  LOADING = "LOADING",
  READY = "READY",
  FAILED = "FAILED",
}

/**
 * Loads the city search data and presents its results. A failed load is not
 * cached: `retry` calls the loader again. Shares the load with the device time
 * location's city label (`useExemplarCity`) through `cityDataCache` (FR8 of
 * show-here-entry-for-device-time).
 * Implements FR6, FR15, NFR-P2 of add-locations-via-search (D8, D9).
 * Implements FR11 of add-settings-page-and-device-time-location (D12): `isDeviceTimeOptionShown`.
 */
export function useCitySearch(load: LoadCitySearch = loadCitySearch) {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ??
    i18n.language) as SupportedLanguage;
  const [search, setSearch] = useState<CitySearch | undefined>(() =>
    readLoadedCitySearch(load),
  );
  const [isFailed, setIsFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` re-runs the load on retry
  useEffect(() => {
    if (readLoadedCitySearch(load) !== undefined) return;
    let isCurrent = true;
    loadCitySearchOnce(load).then(
      (loaded) => {
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
    (
      query: string,
      locations: readonly Location[],
    ): PresentedSearchResult[] => {
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
  const isDeviceTimeOptionShown = useCallback(
    (query: string, locations: readonly Location[]): boolean => {
      if (locations.some(isDeviceTimeLocation)) return false;
      const normalizedQuery = normalizeSearchText(query);
      if (normalizedQuery === "") return true;
      const labels = presentDeviceTimeOptionLabels({
        english: i18n.getFixedT("en"),
        russian: i18n.getFixedT("ru"),
      });
      return labels.some(
        (label) =>
          normalizeSearchText(label).startsWith(normalizedQuery) ||
          splitIntoWords(normalizeSearchText(label)).some((word) =>
            word.startsWith(normalizedQuery),
          ),
      );
    },
    [i18n],
  );
  return { status, presentResults, retry, isDeviceTimeOptionShown };
}
