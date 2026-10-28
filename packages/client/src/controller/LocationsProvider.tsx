import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { localStorageLocationRepository } from "@/adapters";
import { LOCATIONS_WRITE_DEBOUNCE_MS } from "@/constants";
import { type Clock, systemClock } from "@/lib/temporal";
import {
  createStore,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
} from "@/model";
import {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  SaveOutcome,
} from "@/ports";
import {
  type AddLocationInput,
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
};

const statusOf = (result: LocationsLoadResult): LocationsStatus =>
  result.status === LocationsLoadStatus.UNREADABLE
    ? LocationsStatus.UNREADABLE
    : LocationsStatus.READY;

const listOf = (result: LocationsLoadResult) =>
  result.status === LocationsLoadStatus.LOADED ? result.locations : [];

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
    locations: listOf(initialResult),
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
 */
export function LocationsProvider({
  children,
  repository = localStorageLocationRepository,
  writeScheduler = timeoutWriteScheduler,
  clock = systemClock,
  tickScheduler = timeoutTickScheduler,
}: LocationsProviderProps) {
  const [initialResult] = useState(() => repository.load());
  const [store] = useState(() =>
    createLocationsStore(initialResult, clock.timeZoneId()),
  );
  const [loadStatus, setLoadStatus] = useState(() => statusOf(initialResult));
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const [minuteTick, setMinuteTick] = useState(0);
  const cancelPendingWrite = useRef<(() => void) | undefined>(undefined);

  const actions = useMemo(() => {
    const writeNow = (outcome: SaveOutcome) =>
      setHasSaveFailed(outcome === SaveOutcome.FAILED);
    const discardPendingWrite = () => {
      cancelPendingWrite.current?.();
      cancelPendingWrite.current = undefined;
    };
    const flushWrite = () => {
      discardPendingWrite();
      writeNow(repository.save(store.getSnapshot().locations));
    };
    const scheduleWrite = () => {
      discardPendingWrite();
      cancelPendingWrite.current = writeScheduler.schedule(
        flushWrite,
        LOCATIONS_WRITE_DEBOUNCE_MS,
      );
    };
    const dispatchAndSchedule = (
      command: Parameters<typeof store.dispatch>[0],
    ) => {
      const snapshotBefore = store.getSnapshot();
      const outcome = store.dispatch(command);
      if (outcome.ok && store.getSnapshot() !== snapshotBefore) scheduleWrite();
      return outcome;
    };
    return {
      flushPendingWrite: () => {
        if (cancelPendingWrite.current) flushWrite();
      },
      addLocation: (input: AddLocationInput) =>
        dispatchAndSchedule({
          type: LocationCommandType.ADD_LOCATION,
          ...input,
        }),
      removeLocation: (id: string) =>
        dispatchAndSchedule({ type: LocationCommandType.REMOVE_LOCATION, id }),
      moveLocation: (id: string, targetIndex: number) =>
        dispatchAndSchedule({
          type: LocationCommandType.MOVE_LOCATION,
          id,
          targetIndex,
        }),
      resetLocations: () => {
        discardPendingWrite();
        const outcome = repository.clear();
        store.dispatch({
          type: LocationCommandType.REPLACE_LOCATIONS,
          locations: [],
        });
        setLoadStatus(LocationsStatus.READY);
        if (outcome === SaveOutcome.FAILED) setHasSaveFailed(true);
      },
    };
  }, [repository, store, writeScheduler]);

  useEffect(() => {
    const unsubscribe = repository.subscribe((result) => {
      store.dispatch({
        type: LocationCommandType.REPLACE_LOCATIONS,
        locations: listOf(result),
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
      hasSaveFailed,
      addLocation: actions.addLocation,
      removeLocation: actions.removeLocation,
      moveLocation: actions.moveLocation,
      resetLocations: actions.resetLocations,
    }),
    [store, clock, minuteTick, loadStatus, hasSaveFailed, actions],
  );

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
}
