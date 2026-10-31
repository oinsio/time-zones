// Implements FR5, FR6 of add-settings-page-and-device-time-location: the main page in a chosen hour format.
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { MainPage } from "@/app";
import {
  LocationsProvider,
  PreferencesProvider,
  useLocations,
  useReferenceMoment,
} from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DateBar } from "@/views/shared";
import {
  buildStoredDocument,
  getCardOf,
} from "../../locations/steps/deviceTimeQueries";

const DEFAULT_INSTANT = "2026-03-08T07:30:00Z";
const DEFAULT_DEVICE_ZONE = "Asia/Almaty";
const CITY_SEPARATOR = ", ";
const HOUR_FORMATS_BY_OPTION_NAME: Record<string, HourFormat> = {
  "12-hour": HourFormat.H12,
  "24-hour": HourFormat.H24,
};

export const hourFormatOf = (optionName: string) =>
  HOUR_FORMATS_BY_OPTION_NAME[optionName];

/** Per-scenario state of the hour format features that render the main page. */
export const createHourFormatWorld = () => {
  let hourFormat = HourFormat.H24;
  let deviceZone = DEFAULT_DEVICE_ZONE;
  let instant = DEFAULT_INSTANT;
  let cities: string[] = [];
  let latestLocations: ReturnType<typeof useLocations>;
  let latestReference: ReturnType<typeof useReferenceMoment>;

  const Probe = () => {
    latestLocations = useLocations();
    latestReference = useReferenceMoment();
    return null;
  };
  const rowOf = (city: string) => {
    const row = latestLocations.rows.find(
      (candidate) => candidate.cityLabel === city,
    );
    if (row === undefined) throw new Error(`no row for ${city}`);
    return row;
  };
  const openWallTimeInput = async (city: string) => {
    await userEvent.click(
      within(getCardOf(city)).getByRole("button", {
        name: rowOf(city).wallTimeInputLabel,
      }),
    );
    return screen.getByRole("textbox") as HTMLInputElement;
  };

  return {
    reset: async () => {
      cleanup();
      hourFormat = HourFormat.H24;
      deviceZone = DEFAULT_DEVICE_ZONE;
      instant = DEFAULT_INSTANT;
      cities = [];
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    givenLanguage: async (_ctx: unknown, language: string) => {
      await i18n.changeLanguage(language);
    },
    givenHourFormat: (_ctx: unknown, optionName: string) => {
      hourFormat = hourFormatOf(optionName);
    },
    givenZone: (_ctx: unknown, zone: string) => {
      deviceZone = zone;
    },
    givenInstant: (_ctx: unknown, timestamp: string) => {
      instant = timestamp;
    },
    givenList: (_ctx: unknown, list: string) => {
      cities = list.split(CITY_SEPARATOR);
    },
    openApp: async () => {
      const preferencesRepository = createInMemoryPreferencesRepository({
        initialDocument: {
          status: PreferencesLoadStatus.LOADED,
          preferences: { ...DEFAULT_PREFERENCES, hourFormat },
        },
      });
      const backend = createInMemoryLocationBackend(
        buildStoredDocument({
          isListUnreadable: false,
          hasStoredList: true,
          cities,
          homeCity: undefined,
          deviceZone,
        }),
      );
      render(
        <PreferencesProvider
          repository={preferencesRepository}
          writeScheduler={immediateWriteScheduler}
        >
          <LocationsProvider
            repository={createInMemoryLocationRepository({ backend })}
            writeScheduler={immediateWriteScheduler}
            clock={createSwitchableClock(instant, deviceZone)}
            tickScheduler={createManualTickScheduler()}
          >
            <Probe />
            <MainPage notices={null} bottomBar={<DateBar />} />
          </LocationsProvider>
        </PreferencesProvider>,
      );
      await waitFor(() =>
        expect(
          screen.getByRole("main").querySelector("[aria-busy]"),
        ).toBeNull(),
      );
    },
    showNextDay: () =>
      userEvent.click(
        screen.getByRole("button", { name: i18n.t("date.nextDay") }),
      ),
    openWallTimeInput,
    timeOf: (city: string) => rowOf(city).localTimeLabel,
    hourLabelsOf: (city: string) =>
      rowOf(city)
        .dayTrack?.hourLabels.map((hourLabel) => hourLabel.label)
        .join(" "),
    gapNote: () => latestReference.dateBar.gapNote,
    isMomentPinned: () => latestReference.dateBar.isPinned,
    shownInstant: () => latestLocations.rowsContext.instant.toString(),
  };
};
