import { act, cleanup, renderHook } from "@testing-library/react/pure";
import i18n from "i18next";
import type { ReactNode } from "react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { NANOSECONDS_PER_MINUTE, TRACK_STEP_MINUTES } from "@/constants";
import {
  LocationsProvider,
  type TrackMove,
  useHereEntry,
  useLocations,
  useReferenceMoment,
  useTimeSelection,
  useWallTimeInput,
} from "@/controller";
import { Temporal } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { cityEntry } from "../../locations/steps/locationsUiWorld";

export const ENGLISH_LANGUAGE = "en";
export const RUSSIAN_LANGUAGE = "ru";
const CITY_SEPARATOR = ", ";
const DEFAULT_INSTANT = "2026-03-08T07:30:00Z";
const DEFAULT_DEVICE_ZONE = "UTC";

/**
 * Per-scenario state of the time selection features: an in-memory list, a
 * switchable clock, the manual schedulers and the three hooks of the Cards
 * view inside one provider. The pinned instant is read back from the first
 * card, so it is observed the way a user sees it.
 * Implements FR1-FR9 of add-time-sliders-to-location-cards (D6).
 */
export const createTimeSelectionWorld = () => {
  let clock = createSwitchableClock(DEFAULT_INSTANT, DEFAULT_DEVICE_ZONE);
  let backend = createInMemoryLocationBackend();
  let storedLocations: ReturnType<typeof buildLocation>[] = [];
  let homeLocationId: string | null = null;
  let tickScheduler = createManualTickScheduler();
  let writeScheduler = createManualWriteScheduler();
  let hooks: {
    result: {
      current: {
        locations: ReturnType<typeof useLocations>;
        reference: ReturnType<typeof useReferenceMoment>;
        time: ReturnType<typeof useTimeSelection>;
        wallTime: ReturnType<typeof useWallTimeInput>;
        hereEntry: ReturnType<typeof useHereEntry>;
      };
    };
  };

  const current = () => hooks.result.current;
  const rows = () => current().locations.rows;
  const rowOf = (city: string) => {
    const row = rows().find((candidate) => candidate.cityLabel === city);
    if (row === undefined) throw new Error(`no row for ${city}`);
    return row;
  };
  const trackOf = (city: string) => {
    const track = rowOf(city).dayTrack;
    if (track === undefined) throw new Error(`no track for ${city}`);
    return track;
  };
  /** The instant the first card shows, in the zone of that card. */
  const shownInstant = () => {
    const first = zoneOfFirstRow();
    const row = rowOf(first.label);
    return Temporal.PlainDateTime.from(
      `${row.localIsoDate}T${row.localTimeLabel}`,
    )
      .toZonedDateTime(first.timeZoneId, { disambiguation: "earlier" })
      .toInstant()
      .toString();
  };

  const zoneOfFirstRow = () => {
    const first = storedLocations[0];
    if (first === undefined) throw new Error("the list is empty");
    return first;
  };

  return {
    clock: () => clock,
    getWriteScheduler: () => writeScheduler,
    rows,
    rowOf,
    trackOf,
    reference: () => current().reference,
    /** The hooks of the open app: wall-time input, Here entry and the list actions. */
    app: current,
    backendDocument: () => backend.document,
    openOtherTab: () => createInMemoryLocationRepository({ backend }),
    removeCityInAnotherTab: (city: string) => {
      const removedId = buildLocation(cityEntry(city)).id;
      act(() => {
        createInMemoryLocationRepository({ backend }).save({
          locations: storedLocations.filter(
            (location) => location.id !== removedId,
          ),
          homeLocationId: null,
        });
      });
    },
    reset: async () => {
      cleanup();
      storedLocations = [];
      homeLocationId = null;
      backend = createInMemoryLocationBackend();
      clock = createSwitchableClock(DEFAULT_INSTANT, DEFAULT_DEVICE_ZONE);
      tickScheduler = createManualTickScheduler();
      writeScheduler = createManualWriteScheduler();
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage(RUSSIAN_LANGUAGE);
    },
    setLanguage: (language: string) => i18n.changeLanguage(language),
    setInstant: (timestamp: string) =>
      clock.moveTo(timestamp, clock.timeZoneId()),
    setDeviceZone: (zone: string) =>
      clock.moveTo(clock.instant().toString(), zone),
    setStoredCities: (cities: string) => {
      storedLocations = cities
        .split(CITY_SEPARATOR)
        .map((city) => buildLocation(cityEntry(city)));
    },
    setHomeCity: (city: string) => {
      homeLocationId = buildLocation(cityEntry(city)).id;
    },
    setStoredLocations: (locations: ReturnType<typeof buildLocation>[]) => {
      storedLocations = locations;
    },
    open: () => {
      backend.document = storedLocations.length
        ? {
            status: LocationsLoadStatus.LOADED,
            locations: storedLocations,
            homeLocationId,
          }
        : backend.document;
      hooks = renderHook(
        () => ({
          locations: useLocations(),
          reference: useReferenceMoment(),
          time: useTimeSelection(),
          wallTime: useWallTimeInput(),
          hereEntry: useHereEntry(),
        }),
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <LocationsProvider
              repository={createInMemoryLocationRepository({ backend })}
              writeScheduler={writeScheduler}
              clock={clock}
              tickScheduler={tickScheduler}
            >
              {children}
            </LocationsProvider>
          ),
        },
      );
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
    selectFraction: (fraction: number) =>
      act(() => current().time.selectTrackFraction(fraction)),
    moveTrack: (move: TrackMove) => act(() => current().time.moveTrack(move)),
    showNextDay: () => act(() => current().reference.showNextDay()),
    returnToNow: () => act(() => current().reference.returnToNow()),
    runTick: () => act(() => tickScheduler.runPending()),
    isNowShown: () => current().reference.dateBar.isPinned,
    shownInstant,
    /** Start and end of the reference day, worked out from a card's track. */
    dayBoundsOf: (city: string) => {
      const track = trackOf(city);
      const lengthMinutes = track.maxMinutes + TRACK_STEP_MINUTES;
      const effective = Temporal.Instant.from(
        current().reference.dateBar.isPinned
          ? shownInstant()
          : clock.instant().toString(),
      );
      const start = effective
        .subtract({
          nanoseconds: Math.round(
            track.fraction * lengthMinutes * NANOSECONDS_PER_MINUTE,
          ),
        })
        .round({ smallestUnit: "minute" });
      return {
        start,
        end: start.add({ minutes: lengthMinutes }),
        lengthMinutes,
      };
    },
  };
};
