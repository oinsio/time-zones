import { useContext, useSyncExternalStore } from "react";
import { LocationsContext } from "./locationsContext";

const MISSING_PROVIDER_MESSAGE =
  "useLocationList must be used inside a LocationsProvider";

/**
 * The location list alone: the locations, the home location, the device zone,
 * the load status and the clock, with none of the rows `useLocations` presents
 * for the reference moment.
 * Implements FR9, FR18 of add-unix-time-converter-tool (D8).
 */
export function useLocationList() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, loadStatus, loadCitySearch } = context;
  const { locations, homeLocationId, deviceTimeZoneId } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );
  return {
    locations,
    homeLocationId,
    deviceTimeZoneId,
    loadStatus,
    loadCitySearch,
    clock,
  };
}
