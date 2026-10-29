// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import {
  act,
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { type Clock, fakeClock } from "@/lib/temporal";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { cityEntry } from "./locationsUiWorld";

const INSTANT = "2026-07-15T12:00:00Z";
const CITY_SEPARATOR = ", ";
export const RUSSIAN_LANGUAGE = "ru";
export const ENGLISH_LANGUAGE = "en";
const DEFAULT_DEVICE_ZONE = "UTC";

type LocationsHandle = ReturnType<typeof useLocations>;

export const hereCaption = (language: string) =>
  language === RUSSIAN_LANGUAGE
    ? ru.locations.hereMarkCaption
    : en.locations.hereMarkCaption;

/** True when the row holds an element whose whole text is the caption. */
export const rowHasHereMark = (row: HTMLElement, caption: string) =>
  within(row).queryByText(caption, { exact: true }) !== null;

/** Per-scenario state and the step handlers shared by the device time zone feature. */
export const createDeviceTimeZoneWorld = () => {
  let deviceZone = DEFAULT_DEVICE_ZONE;
  let storedCities: string[] = [];
  let homeCity: string | undefined;
  let latestLocations: LocationsHandle;
  let backend: ReturnType<typeof createInMemoryLocationBackend>;

  const clock: Clock = {
    ...fakeClock(INSTANT),
    timeZoneId: () => deviceZone,
  };

  const rowOf = (city: string) =>
    screen
      .getByRole("button", {
        name: i18n.t("locations.locationMenu", { city }),
      })
      .closest("li") as HTMLElement;

  const expectRowShows = (city: string, caption: string) =>
    expect(rowHasHereMark(rowOf(city), caption)).toBe(true);

  return {
    clock,
    rowOf,
    getDeviceZone: () => deviceZone,
    getBackend: () => backend,
    expectRowShows,
    reset: async () => {
      cleanup();
      deviceZone = DEFAULT_DEVICE_ZONE;
      storedCities = [];
      homeCity = undefined;
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
    },
    openApp: () => {
      backend = createInMemoryLocationBackend({
        status: LocationsLoadStatus.LOADED,
        locations: storedCities.map((city) => buildLocation(cityEntry(city))),
        homeLocationId:
          homeCity === undefined ? null : buildLocation(cityEntry(homeCity)).id,
      });
      const Rows = () => {
        latestLocations = useLocations();
        return (
          <LocationList
            rows={latestLocations.rows}
            onRemove={latestLocations.removeLocation}
            onSetHome={latestLocations.setHomeLocation}
            onMove={latestLocations.moveLocation}
            onSelectTrackFraction={() => undefined}
            onMoveTrack={() => undefined}
          />
        );
      };
      render(
        <LocationsProvider
          repository={createInMemoryLocationRepository({ backend })}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          <Rows />
        </LocationsProvider>,
      );
    },
    givenDeviceZone: (_ctx: unknown, zone: string) => {
      deviceZone = zone;
    },
    givenList: (_ctx: unknown, cities: string) => {
      storedCities = cities.split(CITY_SEPARATOR);
    },
    givenHome: (_ctx: unknown, city: string) => {
      homeCity = city;
    },
    givenLanguage: async (_ctx: unknown, language: string) => {
      await i18n.changeLanguage(language);
    },
    thenShowsHereMark: (_ctx: unknown, city: string) =>
      expect(rowHasHereMark(rowOf(city), hereCaption(ENGLISH_LANGUAGE))).toBe(
        true,
      ),
    thenShowsNoHereMark: (_ctx: unknown, city: string) =>
      expect(rowHasHereMark(rowOf(city), hereCaption(ENGLISH_LANGUAGE))).toBe(
        false,
      ),
    thenNoHereMarkAnywhere: () =>
      expect(screen.queryByText(hereCaption(ENGLISH_LANGUAGE))).toBeNull(),
    whenAdds: (_ctx: unknown, city: string) => {
      act(() => {
        latestLocations.addLocation(cityEntry(city));
      });
    },
    whenRemoves: (_ctx: unknown, city: string) => {
      act(() => {
        latestLocations.removeLocation(buildLocation(cityEntry(city)).id);
      });
    },
  };
};
