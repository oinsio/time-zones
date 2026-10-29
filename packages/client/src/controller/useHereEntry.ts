import { useMemo } from "react";
import { type PresentedHereEntry, presentHereEntry } from "@/presenter";
import { useExemplarCity } from "./useExemplarCity";
import { useLocations } from "./useLocations";

/**
 * The presented Here entry, or `undefined` when no entry is shown. Only views
 * that render the entry call it, so only they start the city data load. It
 * is presented from the same context as the rows, so both show one instant.
 * Implements FR2, FR6, FR8 of show-here-entry-for-device-time (D4).
 */
export function useHereEntry(): PresentedHereEntry | undefined {
  const { hereEntry, rowsContext, loadCitySearch } = useLocations();
  const timeZoneId = hereEntry?.timeZoneId;
  const cityLabel = useExemplarCity(timeZoneId, loadCitySearch);
  return useMemo(
    () =>
      timeZoneId === undefined
        ? undefined
        : presentHereEntry(
            { timeZoneId },
            cityLabel ?? timeZoneId,
            rowsContext,
          ),
    [timeZoneId, cityLabel, rowsContext],
  );
}
