import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { AppShell, MainPage } from "@/app";
import { DEVICE_TIME_LOCATION_ID, KeyboardKey } from "@/constants";
import { LocationsProvider, useLocations } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { getUtcOffsetMinutes } from "@/model";
import { formatUtcOffset } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DateBar, LocationSearch } from "@/views/shared";
import { createDataLoaderState, DataMode } from "./deviceTimeDataLoader";
import {
  buildStoredDocument,
  DEVICE_TIME_LIST_TOKEN,
  findDeviceTimeRows,
  getCardOf,
  getDeviceTimeRow,
  getDeviceTimeSlider,
} from "./deviceTimeQueries";
import { cityEntry } from "./locationsUiWorld";

export { DataMode };

const DEFAULT_INSTANT = "2026-03-08T07:30:00Z";
const CITY_SEPARATOR = ", ";
const EMPTY_LIST = "empty";

type LocationsHandle = ReturnType<typeof useLocations>;

/** Per-scenario state and the step handlers shared by the device time features. */
export const createDeviceTimeWorld = () => {
  let deviceZone = "UTC";
  let instant = DEFAULT_INSTANT;
  let cities: string[] = [];
  let homeCity: string | undefined;
  let isListUnreadable = false;
  let hasStoredList = true;
  let latestLocations: LocationsHandle;
  let backend: ReturnType<typeof createInMemoryLocationBackend>;
  let clock = createSwitchableClock(instant, deviceZone);
  let tickScheduler = createManualTickScheduler();
  const dataLoader = createDataLoaderState();

  const Probe = () => {
    latestLocations = useLocations();
    return null;
  };

  return {
    deviceTimeRow: getDeviceTimeRow,
    deviceTimeRows: findDeviceTimeRows,
    cardOf: getCardOf,
    deviceTimeSlider: getDeviceTimeSlider,
    getDataRequests: dataLoader.getRequestCount,
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
      isListUnreadable = false;
      hasStoredList = true;
      dataLoader.reset();
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
      dataLoader.setMode(mode);
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
      const loadCitySearch = dataLoader.createLoader();
      backend = createInMemoryLocationBackend(
        buildStoredDocument({
          isListUnreadable,
          hasStoredList,
          cities,
          homeCity,
          deviceZone,
        }),
      );
      render(
        <LocationsProvider
          repository={createInMemoryLocationRepository({ backend })}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={tickScheduler}
          loadCitySearch={loadCitySearch}
        >
          <Probe />
          <MainPage
            notices={null}
            bottomBar={<DateBar />}
            headerActions={<LocationSearch />}
          />
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
        latestLocations.removeLocation(
          city === DEVICE_TIME_LIST_TOKEN
            ? DEVICE_TIME_LOCATION_ID
            : buildLocation(cityEntry(city)).id,
        );
      });
    },
    whenAddsDeviceTime: () => {
      act(() => {
        latestLocations.addDeviceTimeLocation();
      });
    },
    whenDeviceZoneBecomesAndTicks: (_ctx: unknown, zone: string) => {
      clock.moveTo(instant, zone);
      act(() => tickScheduler.runPending());
    },
    whenMovesDeviceTimeTrackOneHourForward: () => {
      fireEvent.keyDown(getDeviceTimeSlider(), { key: KeyboardKey.PAGE_UP });
    },
    whenDataFinishesLoading: async () => {
      await act(async () => dataLoader.release());
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
