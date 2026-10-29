import type { CitySearch, LoadCitySearch } from "@/ports";

const pendingLoads = new WeakMap<LoadCitySearch, Promise<CitySearch>>();
const loadedSearches = new WeakMap<LoadCitySearch, CitySearch>();

/**
 * Loads the city search data once per loader: a pending or resolved load is
 * shared, a rejected one is dropped so the next call loads again. The Here
 * entry and the open search share one request through it.
 * Implements FR8, NFR-P2 of show-here-entry-for-device-time (D4); the cache
 * moved from `useCitySearch` (FR6, FR15 of add-locations-via-search).
 */
export function loadCitySearchOnce(load: LoadCitySearch): Promise<CitySearch> {
  const pendingLoad = pendingLoads.get(load);
  if (pendingLoad !== undefined) return pendingLoad;
  const newLoad = load().then(
    (search) => {
      loadedSearches.set(load, search);
      return search;
    },
    (error: unknown) => {
      pendingLoads.delete(load);
      throw error;
    },
  );
  pendingLoads.set(load, newLoad);
  return newLoad;
}

/** The resolved search of a loader; `undefined` while loading or not started. */
export function readLoadedCitySearch(
  load: LoadCitySearch,
): CitySearch | undefined {
  return loadedSearches.get(load);
}
