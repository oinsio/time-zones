import { useContext, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "@/i18n";
import { presentLocationRows } from "@/presenter";
import { LocationsContext } from "./locationsContext";

export { LocationsStatus } from "./locationsContext";

const MISSING_PROVIDER_MESSAGE =
  "useLocations must be used inside a LocationsProvider";

/**
 * The locations the user keeps, as presenter rows for views and as the model
 * list for search, with the persistence state and the commands.
 * Implements FR10, FR12, FR13, FR14 of add-locations-via-search (D3).
 * Reads the instant when the rows are presented: FR2, FR4 of
 * show-utc-offset-on-location-rows (D4).
 */
export function useLocations() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, ...rest } = context;
  const { locations } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );
  const { i18n, t } = useTranslation();
  const language = (i18n.resolvedLanguage ??
    i18n.language) as SupportedLanguage;
  const rows = useMemo(
    () =>
      presentLocationRows(locations, {
        language,
        instant: clock.instant(),
        translate: t,
      }),
    [locations, language, t, clock],
  );
  return { rows, locations, ...rest };
}
