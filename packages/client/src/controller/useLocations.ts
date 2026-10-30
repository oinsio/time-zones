import { useContext, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "@/i18n";
import {
  getEffectiveInstant,
  getHereEntry,
  getReferenceDay,
  getReferenceOffsetMinutes,
  getWallClockNote,
} from "@/model";
import { type LocationRowsContext, presentLocationRows } from "@/presenter";
import { LocationsContext, LocationsStatus } from "./locationsContext";

export { LocationsStatus } from "./locationsContext";

const MISSING_PROVIDER_MESSAGE =
  "useLocations must be used inside a LocationsProvider";

/**
 * The locations the user keeps, as presenter rows for views and as the model
 * list for search, with the persistence state and the commands.
 * Implements FR10, FR12, FR13, FR14 of add-locations-via-search (D3).
 * Reads the instant when the rows are presented: FR2, FR4 of
 * show-utc-offset-on-location-rows (D4).
 * Passes the device zone to the presenter: FR1, FR2 of
 * mark-device-time-zone-in-location-list (D3).
 * Presents the rows anew at every minute tick: FR3, FR5 of
 * show-local-time-and-date-on-location-cards (D4).
 * Presents the rows at the effective instant of the reference moment: FR5 of
 * select-date-with-calendar-and-now (D5).
 * Passes the reference day, read at the same instant, to the presenter:
 * Implements FR1, FR2 of add-time-sliders-to-location-cards (D6).
 * Passes the home location and the reference offset, read once per
 * presentation: Implements FR5, FR7 of set-home-location-and-show-differences (D4).
 * Returns the rows context and the Here entry, none while the stored list is
 * unreadable: Implements FR1, FR9 of show-here-entry-for-device-time (D4).
 * Passes the wall-clock note: Implements FR7 of add-wall-time-input-with-hint (D2).
 */
export function useLocations() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, minuteTick, ...rest } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { locations, deviceTimeZoneId, homeLocationId } = state;
  const { i18n, t } = useTranslation();
  const language = (i18n.resolvedLanguage ??
    i18n.language) as SupportedLanguage;
  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick re-presents the rows at each minute
  const { rows, rowsContext } = useMemo(() => {
    const now = clock.instant();
    const instant = getEffectiveInstant(state, now);
    const context: LocationRowsContext = {
      language,
      instant,
      translate: t,
      deviceTimeZoneId,
      homeLocationId,
      referenceOffsetMinutes: getReferenceOffsetMinutes(state, instant),
      referenceDay: getReferenceDay(state, now),
      wallClockNote: getWallClockNote(state),
    };
    return {
      rows: presentLocationRows(locations, context),
      rowsContext: context,
    };
  }, [state, locations, deviceTimeZoneId, language, t, clock, minuteTick]);
  const hereEntry =
    rest.loadStatus === LocationsStatus.UNREADABLE
      ? undefined
      : getHereEntry(state);
  return { rows, rowsContext, hereEntry, locations, ...rest };
}
