// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import {
  act,
  cleanup,
  render,
  screen,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { MainPage } from "@/app";
import {
  LocationsProvider,
  TrackMove,
  useLocations,
  useReferenceMoment,
  useTimeSelection,
  useWallTimeInput,
  WallTimeTargetKind,
} from "@/controller";
import { Temporal } from "@/lib/temporal";
import { type LocationRepository, LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { resetPageVisibility } from "@/test/pageVisibility";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { DateBar } from "@/views/shared";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import {
  barElement,
  clickBarButton,
  isNowActive,
  isNowInactive,
  rowOf,
  shownIsoDate,
} from "./dateSelectionQueries";

export const ENGLISH_LANGUAGE = "en";
export const RUSSIAN_LANGUAGE = "ru";
const CITY_SEPARATOR = ", ";
const DEFAULT_INSTANT = "2026-03-08T07:30:00Z";
const DEFAULT_DEVICE_ZONE = "UTC";

type ReferenceHandle = ReturnType<typeof useReferenceMoment>;
type TimeSelectionHandle = ReturnType<typeof useTimeSelection>;
type LocationsHandle = ReturnType<typeof useLocations>;
type WallTimeHandle = ReturnType<typeof useWallTimeInput>;

/**
 * Per-scenario state of the date selection features: an in-memory list, a
 * switchable clock, the manual schedulers and the main page with its date bar.
 * Implements FR1-FR8 of select-date-with-calendar-and-now (D8).
 */
export const createDateSelectionWorld = () => {
  let clock = createSwitchableClock(DEFAULT_INSTANT, DEFAULT_DEVICE_ZONE);
  let backend = createInMemoryLocationBackend();
  let storedLocations: ReturnType<typeof buildLocation>[] = [];
  let latestReference: ReferenceHandle;
  let latestTimeSelection: TimeSelectionHandle;
  let latestLocations: LocationsHandle;
  let latestWallTime: WallTimeHandle;
  let storedHomeLocationId: string | null = null;
  let repositoryOverride: LocationRepository | undefined;
  let tickScheduler = createManualTickScheduler();
  let writeScheduler = createManualWriteScheduler();

  const Probe = () => {
    latestReference = useReferenceMoment();
    latestTimeSelection = useTimeSelection();
    latestLocations = useLocations();
    latestWallTime = useWallTimeInput();
    return null;
  };

  const deviceDateOf = (timestamp: string) =>
    Temporal.Instant.from(timestamp)
      .toZonedDateTimeISO(clock.timeZoneId())
      .toPlainDate()
      .toString();

  return {
    clock: () => clock,
    getWriteScheduler: () => writeScheduler,
    getTickScheduler: () => tickScheduler,
    getReference: () => latestReference,
    getLocations: () => latestLocations,
    getBackend: () => backend,
    /** Opens the app on this repository instead of the in-memory backend. */
    useRepository: (repository: LocationRepository | undefined) => {
      repositoryOverride = repository;
    },
    rowOf,
    shownIsoDate,
    barElement,
    reset: async () => {
      cleanup();
      resetPageVisibility();
      storedLocations = [];
      storedHomeLocationId = null;
      repositoryOverride = undefined;
      backend = createInMemoryLocationBackend();
      clock = createSwitchableClock(DEFAULT_INSTANT, DEFAULT_DEVICE_ZONE);
      tickScheduler = createManualTickScheduler();
      writeScheduler = createManualWriteScheduler();
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
    },
    finish: async () => {
      cleanup();
      resetPageVisibility();
      await i18n.changeLanguage(RUSSIAN_LANGUAGE);
    },
    setLanguage: async (language: string) => {
      await i18n.changeLanguage(language);
    },
    setInstant: (timestamp: string) =>
      clock.moveTo(timestamp, clock.timeZoneId()),
    setDeviceZone: (zone: string) =>
      clock.moveTo(clock.instant().toString(), zone),
    setStoredCities: (cities: string) => {
      storedLocations = cities
        .split(CITY_SEPARATOR)
        .map((city) => buildLocation(cityEntry(city)));
    },
    setStoredLocations: (locations: ReturnType<typeof buildLocation>[]) => {
      storedLocations = locations;
    },
    setStoredHome: (city: string | null) => {
      storedHomeLocationId =
        city === null ? null : buildLocation(cityEntry(city)).id;
    },
    openApp: async () => {
      backend.document = storedLocations.length
        ? {
            status: LocationsLoadStatus.LOADED,
            locations: storedLocations,
            homeLocationId: storedHomeLocationId,
          }
        : backend.document;
      render(
        <LocationsProvider
          repository={
            repositoryOverride ?? createInMemoryLocationRepository({ backend })
          }
          writeScheduler={writeScheduler}
          clock={clock}
          tickScheduler={tickScheduler}
        >
          <Probe />
          <MainPage notices={null} bottomBar={<DateBar />} />
        </LocationsProvider>,
      );
      await screen.findByRole("group", { name: i18n.t("date.barLabel") });
      if (storedLocations.length > 0 || repositoryOverride) {
        await screen.findAllByRole("listitem");
      }
    },
    addCityInAnotherTab: (city: string) => {
      const otherTab = createInMemoryLocationRepository({ backend });
      act(() => {
        otherTab.save({
          locations: [...storedLocations, buildLocation(cityEntry(city))],
          homeLocationId: null,
        });
      });
    },
    /** Types a time in a row, on the local date the row shows (add-wall-time-input-with-hint). */
    typeWallTime: (city: string, text: string) => {
      const row = latestLocations.rows.find(
        (candidate) => candidate.cityLabel === city,
      );
      if (row === undefined) throw new Error(`no row for ${city}`);
      act(() => {
        latestWallTime.confirmWallTime(
          { kind: WallTimeTargetKind.LOCATION, locationId: row.id },
          text,
          row.localIsoDate,
        );
      });
    },
    wallTimeHints: () =>
      latestLocations.rows.flatMap((row) =>
        row.wallTimeHint === undefined ? [] : [row.cityLabel],
      ),
    moveTrackToNextStep: () =>
      act(() => latestTimeSelection.moveTrack(TrackMove.NEXT_STEP)),
    showNextDay: () => clickBarButton("date.nextDay"),
    showPreviousDay: () => clickBarButton("date.previousDay"),
    returnToNow: () => clickBarButton("date.now"),
    pickDate: (isoDate: string) =>
      act(() => latestReference.selectDate(isoDate)),
    runTick: () => act(() => tickScheduler.runPending()),
    isNowActive,
    expectLive: () => {
      expect(isNowInactive()).toBe(true);
      expect(shownIsoDate()).toBe(deviceDateOf(clock.instant().toString()));
    },
    expectPinnedTo: (timestamp: string) => {
      expect(isNowActive()).toBe(true);
      expect(shownIsoDate()).toBe(deviceDateOf(timestamp));
    },
    expectRowShows: (city: string, time: string, date: string) => {
      const row = rowOf(city);
      expect(
        row.querySelector("time")?.previousElementSibling?.textContent,
      ).toBe(time);
      expect(row.querySelector("time")).toHaveTextContent(date);
    },
    expectRowOffset: (city: string, offset: string) =>
      expect(rowOf(city)).toHaveTextContent(offset),
  };
};
