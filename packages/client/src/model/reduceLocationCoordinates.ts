import { parseCoordinates } from "./coordinates";
import { LocationKind } from "./locationKind";
import type {
  LocationCommand,
  LocationCommandType,
  LocationsReduceResult,
  WorldClockState,
} from "./locations";

type FillLocationCoordinatesCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.FILL_LOCATION_COORDINATES }
>;

/**
 * Gives city locations that hold no coordinates the ones of the command;
 * a location that holds coordinates, the device time location and an id the
 * list lacks are left alone. Returns the same state object when nothing
 * changed, so the controller schedules no write.
 * Implements FR8 of add-city-coordinates-to-locations (D7).
 */
export function reduceLocationCoordinates(
  state: WorldClockState,
  command: FillLocationCoordinatesCommand,
): LocationsReduceResult {
  let hasChanged = false;
  const locations = state.locations.map((location) => {
    if (
      location.kind !== LocationKind.CITY ||
      location.coordinates !== undefined
    ) {
      return location;
    }
    const coordinates = parseCoordinates(
      command.coordinatesByLocationId[location.id],
    );
    if (coordinates === undefined) return location;
    hasChanged = true;
    return { ...location, coordinates };
  });
  return { ok: true, state: hasChanged ? { ...state, locations } : state };
}
