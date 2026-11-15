// Implements FR8, NFR-P2, NFR-P3 of add-city-coordinates-to-locations (D7): a stored list opened over the full city data.
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import {
  createCompositeCitySearch,
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import type { Coordinates, Location } from "@/model";
import {
  type CitySearch,
  type LoadCitySearch,
  LocationsLoadStatus,
} from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { fullCityData, fullZoneCities } from "@/test/fullCityData";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";

export const KAZAN_COORDINATES: Coordinates = {
  latitude: 55.8,
  longitude: 49.1,
};
export const MOSCOW_COORDINATES: Coordinates = {
  latitude: 55.8,
  longitude: 37.6,
};
const OPEN_INSTANT = "2026-03-08T07:30:00Z";
const CITY_SEPARATOR = /, | and /;
export const COORDINATES_BY_LABEL: Record<string, Coordinates> = {
  Moscow: MOSCOW_COORDINATES,
  Kazan: KAZAN_COORDINATES,
};

export const buildCityLocation = (
  label: string,
  coordinates?: Coordinates,
): Location =>
  buildLocation({
    label,
    ...KNOWN_CITIES[label],
    ...(coordinates === undefined ? {} : { coordinates }),
  });

/** Names such as "Moscow, Kazan and Almaty" as locations without coordinates. */
export const parseCityNames = (names: string): string[] =>
  names.split(CITY_SEPARATOR);

export type CoordinatesWorldOptions = {
  locations: readonly Location[];
  homeLocationId?: string | null;
  /** The city data fails to load. */
  isLoadFailing?: boolean;
};

/** The loader of the full city data with its lookups counted and the loads counted. */
export function createCountingLoader(isFailing = false) {
  let lookupCount = 0;
  let loadCount = 0;
  const load: LoadCitySearch = async () => {
    loadCount += 1;
    if (isFailing) throw new Error("offline");
    const search = createCompositeCitySearch(fullZoneCities, fullCityData);
    const countingSearch: CitySearch = {
      ...search,
      getCoordinates: (timeZoneId, storedLabel) => {
        lookupCount += 1;
        return search.getCoordinates(timeZoneId, storedLabel);
      },
    };
    return countingSearch;
  };
  return {
    load,
    getLookupCount: () => lookupCount,
    getLoadCount: () => loadCount,
    resetLookups: () => {
      lookupCount = 0;
    },
  };
}

/** Opens the app over a stored list; counts the writes through the repository. */
export function openStoredList({
  locations,
  homeLocationId = null,
  isLoadFailing = false,
}: CoordinatesWorldOptions) {
  const backend = createInMemoryLocationBackend({
    status: LocationsLoadStatus.LOADED,
    locations,
    homeLocationId,
  });
  const baseRepository = createInMemoryLocationRepository({ backend });
  let writeCount = 0;
  const repository = {
    ...baseRepository,
    save: (stored: Parameters<typeof baseRepository.save>[0]) => {
      writeCount += 1;
      return baseRepository.save(stored);
    },
  };
  const loader = createCountingLoader(isLoadFailing);
  const clock = createSwitchableClock(OPEN_INSTANT);
  const tickScheduler = createManualTickScheduler();
  const app = renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        LocationsProvider,
        {
          repository,
          writeScheduler: immediateWriteScheduler,
          clock,
          tickScheduler,
          loadCitySearch: loader.load,
        },
        children,
      ),
  });
  return {
    app,
    backend,
    loader,
    getWriteCount: () => writeCount,
    /** Another tab: its own repository over the same storage. */
    openOtherTab: () =>
      renderHook(() => useLocations(), {
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(
            LocationsProvider,
            {
              repository: createInMemoryLocationRepository({ backend }),
              writeScheduler: immediateWriteScheduler,
              clock,
              tickScheduler: createManualTickScheduler(),
              loadCitySearch: createCountingLoader(true).load,
            },
            children,
          ),
      }),
    runMinuteTick: () => act(() => tickScheduler.runPending()),
  };
}

export type StoredListWorld = ReturnType<typeof openStoredList>;

export const coordinatesOf = (world: StoredListWorld, label: string) =>
  world.app.result.current.locations.find(
    (location) => location.label === label,
  )?.coordinates;
