import { useContext, useMemo, useSyncExternalStore } from "react";
import { getWatchedZoneIds } from "@/model";
import { LocationsContext } from "./locationsContext";

const MISSING_PROVIDER_MESSAGE =
  "useWatchedZoneIds must be used inside a LocationsProvider";

/**
 * The watched zones of the current state: the zones of the listed locations
 * plus the device time zone. The array changes only when they can.
 * Implements FR9, FR10 of apply-data-updates-silently (D5).
 */
export function useWatchedZoneIds(): readonly string[] {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const state = useSyncExternalStore(
    context.store.subscribe,
    context.store.getSnapshot,
  );
  const { locations, deviceTimeZoneId } = state;
  // biome-ignore lint/correctness/useExhaustiveDependencies: the zones depend on the locations and the device zone only
  return useMemo(() => getWatchedZoneIds(state), [locations, deviceTimeZoneId]);
}
