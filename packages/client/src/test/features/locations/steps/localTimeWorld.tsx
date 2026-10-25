// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { act, cleanup, render, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { type Clock, fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { resetPageVisibility } from "@/test/pageVisibility";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { cityEntry } from "./locationsUiWorld";

export const ENGLISH_LANGUAGE = "en";
export const RUSSIAN_LANGUAGE = "ru";
const CITY_SEPARATOR = ", ";
const DEFAULT_INSTANT = "2026-07-15T12:00:00Z";
const DEFAULT_DEVICE_ZONE = "UTC";

type LocationsHandle = ReturnType<typeof useLocations>;

/**
 * Per-scenario state of the local time features: an in-memory list, a
 * switchable clock, the manual tick scheduler and the page rendered through
 * `LocationList`.
 * Implements FR1-FR6 of show-local-time-and-date-on-location-cards (D7).
 */
export const createLocalTimeWorld = () => {
  let currentClock: Clock;
  let deviceZone = DEFAULT_DEVICE_ZONE;
  let storedLocations: ReturnType<typeof buildLocation>[] = [];
  let latestLocations: LocationsHandle;
  let tickScheduler = createManualTickScheduler();
  let writeScheduler = createManualWriteScheduler();

  const switchableClock: Clock = {
    instant: () => currentClock.instant(),
    plainDateISO: () => currentClock.plainDateISO(),
    timeZoneId: () => deviceZone,
  };

  const rowOf = (city: string) =>
    screen
      .getByRole("button", {
        name: i18n.t("locations.removeLocation", { city }),
      })
      .closest("li") as HTMLElement;

  const timeOf = (city: string) =>
    rowOf(city).querySelector("time")?.previousElementSibling?.textContent;

  const dateElementOf = (city: string) => rowOf(city).querySelector("time");

  return {
    getTickScheduler: () => tickScheduler,
    getWriteScheduler: () => writeScheduler,
    getLatestLocations: () => latestLocations,
    rowOf,
    timeOf,
    dateElementOf,
    reset: async () => {
      cleanup();
      resetPageVisibility();
      storedLocations = [];
      deviceZone = DEFAULT_DEVICE_ZONE;
      currentClock = fakeClock(DEFAULT_INSTANT);
      tickScheduler = createManualTickScheduler();
      writeScheduler = createManualWriteScheduler();
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
    },
    finish: async () => {
      cleanup();
      resetPageVisibility();
      await i18n.changeLanguage(RUSSIAN_LANGUAGE);
    },
    setInstant: (timestamp: string) => {
      currentClock = fakeClock(timestamp);
    },
    setDeviceZone: (zone: string) => {
      deviceZone = zone;
    },
    setStoredCities: (cities: string) => {
      storedLocations = cities
        .split(CITY_SEPARATOR)
        .map((city) => buildLocation(cityEntry(city)));
    },
    setStoredLocations: (locations: ReturnType<typeof buildLocation>[]) => {
      storedLocations = locations;
    },
    openApp: (isImmediateWrite = false) => {
      const Rows = () => {
        latestLocations = useLocations();
        return (
          <LocationList
            rows={latestLocations.rows}
            onRemove={latestLocations.removeLocation}
            onMove={latestLocations.moveLocation}
            onSelectTrackFraction={() => undefined}
            onMoveTrack={() => undefined}
          />
        );
      };
      render(
        <LocationsProvider
          repository={createInMemoryLocationRepository({
            initialDocument: {
              status: LocationsLoadStatus.LOADED,
              locations: storedLocations,
            },
          })}
          writeScheduler={
            isImmediateWrite ? immediateWriteScheduler : writeScheduler
          }
          clock={switchableClock}
          tickScheduler={tickScheduler}
        >
          <Rows />
        </LocationsProvider>,
      );
    },
    addCity: (city: string) => {
      act(() => {
        latestLocations.addLocation(cityEntry(city));
      });
    },
    runTick: () => {
      act(() => tickScheduler.runPending());
    },
    expectRowShowsTimeAndDate: (city: string, time: string, date: string) => {
      expect(timeOf(city)).toBe(time);
      expect(dateElementOf(city)).toHaveTextContent(date);
    },
  };
};
