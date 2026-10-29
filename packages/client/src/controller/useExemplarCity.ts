import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { deriveCityNameFromTimeZoneId } from "@/adapters";
import type { SupportedLanguage } from "@/i18n";
import type { LoadCitySearch } from "@/ports";
import { loadCitySearchOnce, readLoadedCitySearch } from "./cityDataCache";

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
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ??
    i18n.language) as SupportedLanguage;
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
      language,
    ) ?? deriveCityNameFromTimeZoneId(timeZoneId)
  );
}
