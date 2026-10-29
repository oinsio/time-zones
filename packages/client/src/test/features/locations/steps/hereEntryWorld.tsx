// Implements FR1-FR9 of show-here-entry-for-device-time (D4-D6): the world of the Here entry features.
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.

import zoneCities from "virtual:zone-cities";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import {
  createCompositeCitySearch,
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { AppShell, MainPage } from "@/app";
import { KeyboardKey } from "@/constants";
import { LocationsProvider, useLocations } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { getUtcOffsetMinutes } from "@/model";
import { type LoadCitySearch, LocationsLoadStatus } from "@/ports";
import { formatUtcOffset } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DateBar } from "@/views/shared";
import { cityEntry } from "./locationsUiWorld";

const DEFAULT_INSTANT = "2026-03-08T07:30:00Z";
const CITY_SEPARATOR = ", ";
const EMPTY_LIST = "empty";

export enum DataMode {
  LOADED = "LOADED",
  HELD = "HELD",
  FAILING = "FAILING",
}

type LocationsHandle = ReturnType<typeof useLocations>;

/** The part of the Here entry's name that no city or mark changes. */
const deviceTimeName = () =>
  i18n.t("locations.hereEntryName").split(", ").at(-1);

/** Per-scenario state and the step handlers shared by the Here entry features. */
export const createHereEntryWorld = () => {
  let deviceZone = "UTC";
  let instant = DEFAULT_INSTANT;
  let cities: string[] = [];
  let homeCity: string | undefined;
  let dataMode = DataMode.LOADED;
  let isListUnreadable = false;
  let hasStoredList = true;
  let dataRequests = 0;
  let releaseData: () => void = () => undefined;
  let latestLocations: LocationsHandle;
  let backend: ReturnType<typeof createInMemoryLocationBackend>;
  let clock = createSwitchableClock(instant, deviceZone);
  let tickScheduler = createManualTickScheduler();

  /** A new loader per opened app: the city data cache is keyed by loader. */
  const createLoader = (): LoadCitySearch => () => {
    dataRequests += 1;
    if (dataMode === DataMode.FAILING)
      return Promise.reject(new Error("offline"));
    const search = createCompositeCitySearch(zoneCities);
    if (dataMode === DataMode.LOADED) return Promise.resolve(search);
    return new Promise((resolve) => {
      releaseData = () => resolve(search);
    });
  };

  const hereEntries = () =>
    screen
      .queryAllByRole("region")
      .filter((region) =>
        (region.getAttribute("aria-label") ?? "").endsWith(
          deviceTimeName() ?? "",
        ),
      );
  const hereEntry = () => {
    const [entry] = hereEntries();
    expect(entry, "the Here entry").toBeDefined();
    return entry;
  };
  const cardOf = (city: string) =>
    screen
      .getByRole("button", { name: i18n.t("locations.locationMenu", { city }) })
      .closest("li") as HTMLElement;
  const hereSlider = () => within(hereEntry()).getByRole("slider");

  const buildDocument = () => {
    if (isListUnreadable)
      return { status: LocationsLoadStatus.UNREADABLE } as const;
    if (!hasStoredList) return { status: LocationsLoadStatus.EMPTY } as const;
    return {
      status: LocationsLoadStatus.LOADED,
      locations: cities.map((city) => buildLocation(cityEntry(city))),
      homeLocationId:
        homeCity === undefined ? null : buildLocation(cityEntry(homeCity)).id,
    } as const;
  };

  const Probe = () => {
    latestLocations = useLocations();
    return null;
  };

  return {
    hereEntry,
    hereEntries,
    cardOf,
    hereSlider,
    getDataRequests: () => dataRequests,
    /** "UTC+5" for a zone at the scenario instant. */
    formatOffsetOf: (zone: string) =>
      formatUtcOffset(
        getUtcOffsetMinutes(zone, fakeClock(instant).instant()) ?? 0,
        i18n.t("locations.utcOffsetPrefix"),
      ),
    getDeviceZone: () => deviceZone,
    getInstant: () => instant,
    getClock: () => clock,
    getLocations: () => latestLocations,
    getBackend: () => backend,
    reset: async () => {
      cleanup();
      localStorage.clear();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      deviceZone = "UTC";
      instant = DEFAULT_INSTANT;
      cities = [];
      homeCity = undefined;
      dataMode = DataMode.LOADED;
      isListUnreadable = false;
      hasStoredList = true;
      dataRequests = 0;
      await i18n.changeLanguage("en");
    },
    givenDeviceZone: (_ctx: unknown, zone: string) => {
      deviceZone = zone;
    },
    givenInstant: (_ctx: unknown, timestamp: string) => {
      instant = timestamp;
    },
    givenList: (_ctx: unknown, list: string) => {
      cities = list === EMPTY_LIST ? [] : list.split(CITY_SEPARATOR);
    },
    givenEmptyList: () => {
      cities = [];
    },
    givenHome: (_ctx: unknown, city: string) => {
      homeCity = city;
    },
    givenLanguage: async (_ctx: unknown, language: string) => {
      await i18n.changeLanguage(language);
    },
    givenData: (mode: DataMode) => () => {
      dataMode = mode;
    },
    givenNoStoredList: () => {
      hasStoredList = false;
    },
    givenUnreadableList: () => {
      isListUnreadable = true;
    },
    openApp: async () => {
      clock = createSwitchableClock(instant, deviceZone);
      tickScheduler = createManualTickScheduler();
      const loadCitySearch = createLoader();
      backend = createInMemoryLocationBackend(buildDocument());
      render(
        <LocationsProvider
          repository={createInMemoryLocationRepository({ backend })}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={tickScheduler}
          loadCitySearch={loadCitySearch}
        >
          <Probe />
          <MainPage notices={null} bottomBar={<DateBar />} />
        </LocationsProvider>,
      );
      await waitFor(() =>
        expect(
          screen.getByRole("main").querySelector("[aria-busy]"),
        ).toBeNull(),
      );
    },
    /** Renders the whole app on a storage that cannot be used. */
    openAppShell: async () => {
      clock = createSwitchableClock(instant, deviceZone);
      stubZoneCitiesFetch();
      vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });
      render(createElement(AppShell, { clock }));
      await waitFor(() =>
        expect(
          screen.getByRole("main").querySelector("[aria-busy]"),
        ).toBeNull(),
      );
    },
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
    whenDeviceZoneBecomesAndTicks: (_ctx: unknown, zone: string) => {
      clock.moveTo(instant, zone);
      act(() => tickScheduler.runPending());
    },
    whenMovesHereTrackOneHourForward: () => {
      fireEvent.keyDown(hereSlider(), { key: KeyboardKey.PAGE_UP });
    },
    whenDataFinishesLoading: async () => {
      await act(async () => releaseData());
    },
    whenOpensSearch: async () => {
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
      );
      await screen.findByText(i18n.t("locations.suggestionsHeading"));
    },
    nowButton: () => screen.queryByRole("button", { name: i18n.t("date.now") }),
  };
};
