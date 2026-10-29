import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  loadCitySearch as defaultLoadCitySearch,
  localStorageLocationRepository,
} from "@/adapters";
import { type Clock, systemClock } from "@/lib/temporal";
import {
  createStore,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
} from "@/model";
import {
  type LoadCitySearch,
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  type StoredLocations,
} from "@/ports";
import { createLocationsActions } from "./createLocationsActions";
import {
  LocationsContext,
  type LocationsContextValue,
  LocationsStatus,
} from "./locationsContext";
import { type TickScheduler, timeoutTickScheduler } from "./tickScheduler";
import { useMinuteTick } from "./useMinuteTick";
import { timeoutWriteScheduler, type WriteScheduler } from "./writeScheduler";

const PAGE_HIDE_EVENT = "pagehide";

type LocationsProviderProps = {
  children?: ReactNode;
  repository?: LocationRepository;
  writeScheduler?: WriteScheduler;
  clock?: Clock;
  tickScheduler?: TickScheduler;
  loadCitySearch?: LoadCitySearch;
};

const statusOf = (result: LocationsLoadResult): LocationsStatus =>
  result.status === LocationsLoadStatus.UNREADABLE
    ? LocationsStatus.UNREADABLE
    : LocationsStatus.READY;

const storedOf = (result: LocationsLoadResult): StoredLocations =>
  result.status === LocationsLoadStatus.LOADED
    ? { locations: result.locations, homeLocationId: result.homeLocationId }
    : { locations: [], homeLocationId: null };

function createLocationsStore(
  initialResult: LocationsLoadResult,
  deviceTimeZoneId: string,
) {
  const store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  store.dispatch({
    type: LocationCommandType.SET_DEVICE_TIME_ZONE,
    timeZoneId: deviceTimeZoneId,
  });
  store.dispatch({
    type: LocationCommandType.REPLACE_LOCATIONS,
    ...storedOf(initialResult),
  });
  return store;
}

/**
 * Owns the locations store and its persistence: loads once, writes only after
 * the user's own changes (debounced, flushed on `pagehide`), applies changes
 * made by other tabs, and reports a failed save.
 * Implements FR11, FR12, FR13, FR14 of add-locations-via-search (D3, D5).
 * A move writes only when it changed the list (FR3 of
 * reorder-locations-by-drag-and-drop, D2).
 * Hands the clock to `useLocations` for the UTC offsets (FR4 of
 * show-utc-offset-on-location-rows, D4).
 * Reads the device zone once at store creation: FR3, FR4 of
 * mark-device-time-zone-in-location-list (D3).
 * Ticks at every minute boundary while the page is visible: re-reads the
 * device zone and re-presents the rows without writing (FR3, FR4 of
 * show-local-time-and-date-on-location-cards, D4).
 * Loads, applies and writes the home location with the list: FR8, FR10 of
 * set-home-location-and-show-differences (D6).
 * Hands the city data loader to the Here entry and the search: FR8 of
 * show-here-entry-for-device-time (D4).
 */
export function LocationsProvider({
  children,
  repository = localStorageLocationRepository,
  writeScheduler = timeoutWriteScheduler,
  clock = systemClock,
  tickScheduler = timeoutTickScheduler,
  loadCitySearch = defaultLoadCitySearch,
}: LocationsProviderProps) {
  const [initialResult] = useState(() => repository.load());
  const [store] = useState(() =>
    createLocationsStore(initialResult, clock.timeZoneId()),
  );
  const [loadStatus, setLoadStatus] = useState(() => statusOf(initialResult));
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const [minuteTick, setMinuteTick] = useState(0);
  const cancelPendingWrite = useRef<(() => void) | undefined>(undefined);

  const actions = useMemo(
    () =>
      createLocationsActions({
        repository,
        store,
        writeScheduler,
        cancelPendingWrite,
        setHasSaveFailed,
        setLoadStatus,
      }),
    [repository, store, writeScheduler],
  );

  useEffect(() => {
    const unsubscribe = repository.subscribe((result) => {
      store.dispatch({
        type: LocationCommandType.REPLACE_LOCATIONS,
        ...storedOf(result),
      });
      setLoadStatus(statusOf(result));
    });
    window.addEventListener(PAGE_HIDE_EVENT, actions.flushPendingWrite);
    return () => {
      unsubscribe();
      window.removeEventListener(PAGE_HIDE_EVENT, actions.flushPendingWrite);
    };
  }, [repository, store, actions]);

  useMinuteTick({
    clock,
    tickScheduler,
    onTick: () => {
      store.dispatch({
        type: LocationCommandType.SET_DEVICE_TIME_ZONE,
        timeZoneId: clock.timeZoneId(),
      });
      setMinuteTick((previousTick) => previousTick + 1);
    },
  });

  const value = useMemo<LocationsContextValue>(
    () => ({
      store,
      clock,
      minuteTick,
      loadStatus,
      loadCitySearch,
      hasSaveFailed,
      addLocation: actions.addLocation,
      removeLocation: actions.removeLocation,
      moveLocation: actions.moveLocation,
      setHomeLocation: actions.setHomeLocation,
      resetLocations: actions.resetLocations,
    }),
    [
      store,
      clock,
      minuteTick,
      loadStatus,
      loadCitySearch,
      hasSaveFailed,
      actions,
    ],
  );

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
}
