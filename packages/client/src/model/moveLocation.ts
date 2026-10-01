import {
  LocationErrorCode,
  type LocationsReduceResult,
  type LocationsState,
} from "./locations";

/**
 * Moves one location to a new 0-based index of the list after the move.
 * A move to the current index returns the very same state object.
 * Implements FR2 of reorder-locations-by-drag-and-drop (D1).
 */
export function moveLocationInList(
  state: LocationsState,
  id: string,
  targetIndex: number,
): LocationsReduceResult {
  const currentIndex = state.locations.findIndex(
    (location) => location.id === id,
  );
  if (currentIndex === -1) {
    return { ok: false, error: LocationErrorCode.LOCATION_NOT_FOUND };
  }
  const isTargetInRange =
    Number.isInteger(targetIndex) &&
    targetIndex >= 0 &&
    targetIndex < state.locations.length;
  if (!isTargetInRange) {
    return {
      ok: false,
      error: LocationErrorCode.LOCATION_POSITION_OUT_OF_RANGE,
    };
  }
  if (targetIndex === currentIndex) {
    return { ok: true, state };
  }
  const reordered = [...state.locations];
  const [movedLocation] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, movedLocation);
  return { ok: true, state: { locations: reordered } };
}
