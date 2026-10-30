import type { MutableRefObject } from "react";
import { LOCATIONS_WRITE_DEBOUNCE_MS } from "@/constants";
import { buildFirstLaunchLocations, LocationCommandType } from "@/model";
import { type LocationRepository, SaveOutcome } from "@/ports";
import {
  type LocationsContextValue,
  LocationsStatus,
  type WorldClockStore,
} from "./locationsContext";
import type { WriteScheduler } from "./writeScheduler";

type LocationsActionsDependencies = {
  repository: LocationRepository;
  store: WorldClockStore;
  writeScheduler: WriteScheduler;
  cancelPendingWrite: MutableRefObject<(() => void) | undefined>;
  setHasSaveFailed: (hasSaveFailed: boolean) => void;
  setLoadStatus: (loadStatus: LocationsStatus) => void;
};

type LocationsActions = Pick<
  LocationsContextValue,
  | "addLocation"
  | "addDeviceTimeLocation"
  | "removeLocation"
  | "moveLocation"
  | "setHomeLocation"
  | "resetLocations"
> & { flushPendingWrite: () => void };

/**
 * The commands of the locations store, each followed by a debounced write of
 * the list together with the home location. Writes only when the state
 * changed.
 * Implements FR11, FR12, FR13, FR14 of add-locations-via-search (D3, D5).
 * A move writes only when it changed the list (FR3 of
 * reorder-locations-by-drag-and-drop, D2).
 * Implements FR3, FR10 of set-home-location-and-show-differences (D1, D6).
 * Implements FR11, FR12 of add-settings-page-and-device-time-location (D3, D12).
 */
export function createLocationsActions({
  repository,
  store,
  writeScheduler,
  cancelPendingWrite,
  setHasSaveFailed,
  setLoadStatus,
}: LocationsActionsDependencies): LocationsActions {
  const writeNow = (outcome: SaveOutcome) =>
    setHasSaveFailed(outcome === SaveOutcome.FAILED);
  const discardPendingWrite = () => {
    cancelPendingWrite.current?.();
    cancelPendingWrite.current = undefined;
  };
  const flushWrite = () => {
    discardPendingWrite();
    const { locations, homeLocationId } = store.getSnapshot();
    writeNow(repository.save({ locations, homeLocationId }));
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
    addLocation: (input) =>
      dispatchAndSchedule({ type: LocationCommandType.ADD_LOCATION, ...input }),
    addDeviceTimeLocation: () =>
      dispatchAndSchedule({
        type: LocationCommandType.ADD_DEVICE_TIME_LOCATION,
      }),
    removeLocation: (id) =>
      dispatchAndSchedule({ type: LocationCommandType.REMOVE_LOCATION, id }),
    moveLocation: (id, targetIndex) =>
      dispatchAndSchedule({
        type: LocationCommandType.MOVE_LOCATION,
        id,
        targetIndex,
      }),
    setHomeLocation: (id) =>
      dispatchAndSchedule({ type: LocationCommandType.SET_HOME_LOCATION, id }),
    resetLocations: () => {
      discardPendingWrite();
      const outcome = repository.clear();
      store.dispatch({
        type: LocationCommandType.REPLACE_LOCATIONS,
        locations: buildFirstLaunchLocations(
          store.getSnapshot().deviceTimeZoneId,
        ),
        homeLocationId: null,
      });
      setLoadStatus(LocationsStatus.READY);
      if (outcome === SaveOutcome.FAILED) setHasSaveFailed(true);
    },
  };
}
