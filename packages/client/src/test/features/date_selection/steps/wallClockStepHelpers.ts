import { ONE_DAY } from "@/constants";
import {
  createStore,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  ReferenceMode,
  reduceLocations,
} from "@/model";
import type { createDateSelectionWorld } from "./dateSelectionWorld";

const NOTE_TEXT_SELECTOR = "p.text-xs";

type DateSelectionWorld = ReturnType<typeof createDateSelectionWorld>;

/** The wall-clock status of the moment after moving one day on from `timestamp`. */
export const statusOfNextDayFrom = (
  world: DateSelectionWorld,
  timestamp: string,
) => {
  const statusStore = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  statusStore.dispatch({
    type: LocationCommandType.SET_DEVICE_TIME_ZONE,
    timeZoneId: world.clock().timeZoneId(),
  });
  statusStore.dispatch({
    type: LocationCommandType.SHIFT_DATE,
    days: ONE_DAY,
    now: timestamp,
  });
  const { reference } = statusStore.getSnapshot();
  return reference.mode === ReferenceMode.PINNED
    ? reference.wallClockStatus
    : undefined;
};

/** The gap note text shown in the date bar, if any. */
export const noteOfBar = (world: DateSelectionWorld) =>
  world.barElement().querySelector(NOTE_TEXT_SELECTOR)?.textContent;
