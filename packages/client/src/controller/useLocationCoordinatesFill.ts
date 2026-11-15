import { useEffect, useRef } from "react";
import { type Coordinates, type Location, LocationKind } from "@/model";
import type { LoadCitySearch } from "@/ports";
import { loadCitySearchOnce } from "./cityDataCache";

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
    coordinatesByLocationId: Record<string, Coordinates>,
  ) => void,
): void {
  const latestLocations = useRef(locations);
  latestLocations.current = locations;
  const lookedUp = useRef({ load, ids: new Set<string>() });
  if (lookedUp.current.load !== load)
    lookedUp.current = { load, ids: new Set() };
  const missingKey = JSON.stringify(
    locations.filter(isCityLocationWithoutCoordinates).map(({ id }) => id),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: missingKey stands for the locations that lack coordinates
  useEffect(() => {
    const { ids } = lookedUp.current;
    const findPending = () =>
      latestLocations.current.filter(
        (location) =>
          isCityLocationWithoutCoordinates(location) && !ids.has(location.id),
      );
    if (findPending().length === 0) return;
    let isCancelled = false;
    loadCitySearchOnce(load).then(
      (search) => {
        if (isCancelled) return;
        const coordinatesByLocationId: Record<string, Coordinates> = {};
        for (const location of findPending()) {
          ids.add(location.id);
          const coordinates = search.getCoordinates(
            location.timeZoneId,
            location.label,
          );
          if (coordinates !== undefined) {
            coordinatesByLocationId[location.id] = coordinates;
          }
        }
        if (Object.keys(coordinatesByLocationId).length > 0) {
          fillLocationCoordinates(coordinatesByLocationId);
        }
      },
      () => undefined,
    );
    return () => {
      isCancelled = true;
    };
  }, [missingKey, load, fillLocationCoordinates]);
}
