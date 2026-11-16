import { useEffect } from "react";
import { type Coordinates, type Location, LocationKind } from "@/model";
import type { LoadCitySearch } from "@/ports";
import { loadCitySearchOnce } from "./cityDataCache";

const lookedUpIdsByLoader = new WeakMap<LoadCitySearch, Set<string>>();

const isCityLocationWithoutCoordinates = (location: Location): boolean =>
  location.kind === LocationKind.CITY && location.coordinates === undefined;

/**
 * Gives stored city locations their coordinates once the city data is loaded:
 * one `getCoordinates` lookup per city location that lacks them, once per
 * load, then one command. Nothing is requested or looked up when every city
 * location has coordinates; a failed load stays silent. A minute tick changes
 * no location, so it looks up nothing.
 * Implements FR8, NFR-P2 of add-city-coordinates-to-locations (D7).
 */
export function useLocationCoordinatesFill(
  locations: readonly Location[],
  load: LoadCitySearch,
  fillLocationCoordinates: (
    coordinatesByLocationId: Record<string, Coordinates | undefined>,
  ) => void,
): void {
  useEffect(() => {
    const missing = locations.filter(isCityLocationWithoutCoordinates);
    if (missing.length === 0) return;
    const lookedUpIds = lookedUpIdsByLoader.get(load) ?? new Set<string>();
    lookedUpIdsByLoader.set(load, lookedUpIds);
    loadCitySearchOnce(load).then(
      (search) =>
        // A command that gives nothing leaves the state as it is: no write.
        fillLocationCoordinates(
          Object.fromEntries(
            missing
              .filter(({ id }) => !lookedUpIds.has(id))
              .map(({ id, timeZoneId, label }) => {
                lookedUpIds.add(id);
                return [id, search.getCoordinates(timeZoneId, label)];
              }),
          ),
        ),
      () => undefined,
    );
  }, [locations, load, fillLocationCoordinates]);
}
