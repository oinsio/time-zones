import { parseCoordinates } from "./coordinates";
import type { LocationCommand, LocationCommandType } from "./locationCommands";
import { LocationKind } from "./locationKind";
import type { LocationsReduceResult, WorldClockState } from "./locations";

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
  const locations = state.locations.map((location) => {
    const coordinates =
      location.kind === LocationKind.CITY &&
      location.coordinates === undefined &&
      parseCoordinates(command.coordinatesByLocationId[location.id]);
    return coordinates ? { ...location, coordinates } : location;
  });
  const hasChanged = locations.some(
    (location, index) => location !== state.locations[index],
  );
  return { ok: true, state: hasChanged ? { ...state, locations } : state };
}
