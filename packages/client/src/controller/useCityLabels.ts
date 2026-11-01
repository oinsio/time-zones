import { useEffect, useMemo, useState } from "react";
import { type Location, LocationKind } from "@/model";
import type { LoadCitySearch } from "@/ports";
import { loadCitySearchOnce, readLoadedCitySearch } from "./cityDataCache";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";

const isCityLocation = (location: Location): boolean =>
  location.kind === LocationKind.CITY;

/**
 * The city label of every city location in the interface language, by
 * location ID. `undefined` until the city data is loaded, so rows show their
 * stored labels meanwhile. The load starts after the first render while the
 * list holds a city location; a failed load keeps `undefined`: no error
 * state, no retry. A minute tick looks up no label, a language switch looks up
 * one per city location.
 * Implements FR1, FR2, FR4, NFR-P1 of show-city-labels-in-interface-language (D3).
 */
export function useCityLabels(
  locations: readonly Location[],
  load: LoadCitySearch,
): ReadonlyMap<string, string> | undefined {
  const { cityNameLanguage } = useActiveInterfaceLanguage();
  const [loadedSearch, setLoadedSearch] = useState(() =>
    readLoadedCitySearch(load),
  );
  const hasCityLocation = locations.some(isCityLocation);

  useEffect(() => {
    if (!hasCityLocation) return;
    loadCitySearchOnce(load).then(setLoadedSearch, () => undefined);
  }, [hasCityLocation, load]);

  return useMemo(() => {
    if (loadedSearch === undefined) return undefined;
    return new Map(
      locations
        .filter(isCityLocation)
        .map((location) => [
          location.id,
          loadedSearch.getCityLabel(
            location.timeZoneId,
            location.label,
            cityNameLanguage,
          ),
        ]),
    );
  }, [locations, cityNameLanguage, loadedSearch]);
}
