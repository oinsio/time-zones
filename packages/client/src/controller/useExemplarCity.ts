import { useEffect, useState } from "react";
import { deriveCityNameFromTimeZoneId } from "@/adapters";
import type { LoadCitySearch } from "@/ports";
import { loadCitySearchOnce, readLoadedCitySearch } from "./cityDataCache";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";

/**
 * The exemplar city of a zone: the name derived from the zone ID at once, the
 * name from the city data once it is loaded. The load starts after the first
 * render and a failed load keeps the derived name: no error state, no retry.
 * `undefined` for an `undefined` zone, which never starts a load.
 * Implements FR8, NFR-P2 of show-here-entry-for-device-time (D4).
 */
export function useExemplarCity(
  timeZoneId: string | undefined,
  load: LoadCitySearch,
): string | undefined {
  const { cityNameLanguage } = useActiveInterfaceLanguage();
  const [loadedSearch, setLoadedSearch] = useState(() =>
    readLoadedCitySearch(load),
  );

  useEffect(() => {
    if (timeZoneId === undefined) return;
    loadCitySearchOnce(load).then(setLoadedSearch, () => undefined);
  }, [timeZoneId, load]);

  if (timeZoneId === undefined) return undefined;
  return (
    (loadedSearch ?? readLoadedCitySearch(load))?.getExemplarCity(
      timeZoneId,
      cityNameLanguage,
    ) ?? deriveCityNameFromTimeZoneId(timeZoneId)
  );
}
