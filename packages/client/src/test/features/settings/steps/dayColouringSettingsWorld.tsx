// Implements FR1–FR7 of add-day-colouring-setting: the settings page and the location rows over real preferences storage.
import {
  act,
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryLocationRepository,
  createLocalStoragePreferencesRepository,
  type LocationsSyncChannel,
} from "@/adapters";
import { SettingsPage } from "@/app/settings";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import {
  LocationsProvider,
  PreferencesProvider,
  useLocations,
} from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus, PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import type { DayColour, LocationRow } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { cityEntry } from "../../locations/steps/locationsUiWorld";

const NO_OP = () => undefined;
const INSTANT = "2026-03-09T06:00:00Z";
const PAGE_HIDE_EVENT = "pagehide";

type Tab = {
  container: HTMLElement;
  writeScheduler: ReturnType<typeof createManualWriteScheduler>;
  rows: { current: readonly LocationRow[] };
};

const RowsProbe = ({ rows }: { rows: Tab["rows"] }) => {
  rows.current = useLocations().rows;
  return null;
};

/** The stored payload of the current schema, with the given fields over the defaults. */
export const buildStoredPayload = (fields: Record<string, unknown>) => ({
  theme: DEFAULT_PREFERENCES.theme,
  hourFormat: DEFAULT_PREFERENCES.hourFormat,
  interfaceLanguage: DEFAULT_PREFERENCES.interfaceLanguage,
  zoneLabelParts: DEFAULT_PREFERENCES.zoneLabelParts,
  viewMode: DEFAULT_PREFERENCES.viewMode,
  dayColouring: DEFAULT_PREFERENCES.dayColouring,
  workingHours: DEFAULT_PREFERENCES.workingHours,
  ...fields,
});

/** Per-scenario state of the day colouring settings features. */
export const createDayColouringSettingsWorld = () => {
  let cityLabels: string[] = ["Almaty"];
  let createChannel: () => LocationsSyncChannel | undefined = () => undefined;
  const tabs: Tab[] = [];

  const openTab = (): Tab => {
    const container = document.body.appendChild(document.createElement("div"));
    const writeScheduler = createManualWriteScheduler();
    const rows: Tab["rows"] = { current: [] };
    render(
      <PreferencesProvider
        repository={createLocalStoragePreferencesRepository({
          getStorage: () => localStorage,
          createChannel,
        })}
        writeScheduler={writeScheduler}
      >
        <LocationsProvider
          repository={createInMemoryLocationRepository({
            initialDocument: {
              status: LocationsLoadStatus.LOADED,
              locations: cityLabels.map((label) =>
                buildLocation(cityEntry(label)),
              ),
              homeLocationId: null,
            },
          })}
          writeScheduler={immediateWriteScheduler}
          clock={fakeClock(INSTANT)}
          tickScheduler={createManualTickScheduler()}
        >
          <RowsProbe rows={rows} />
          <SettingsPage notices={null} onBack={NO_OP} />
        </LocationsProvider>
      </PreferencesProvider>,
      { container },
    );
    const tab = { container, writeScheduler, rows };
    tabs.push(tab);
    return tab;
  };
  const firstTab = () => tabs[0] as Tab;
  const colouringGroup = (tab = firstTab()) =>
    within(tab.container).getByRole("radiogroup", {
      name: i18n.t("settings.dayColouringLabel"),
    });
  const workingHoursRow = (tab = firstTab()) =>
    within(tab.container).queryByRole("group", {
      name: i18n.t("settings.workingHoursLabel"),
    });
  const field = (labelKey: string, tab = firstTab()) =>
    within(tab.container).getByRole("textbox", { name: i18n.t(labelKey) });

  return {
    reset: async () => {
      cleanup();
      tabs.length = 0;
      cityLabels = ["Almaty"];
      createChannel = () => undefined;
      localStorage.clear();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    setLanguage: (language: string) => i18n.changeLanguage(language),
    setList: (...cities: string[]) => {
      cityLabels = cities;
    },
    /** The preferences the storage holds, migrated, without writing anything. */
    loadStoredPreferences: () => {
      const result = createLocalStoragePreferencesRepository({
        getStorage: () => localStorage,
        createChannel: () => undefined,
      }).load();
      return result.status === PreferencesLoadStatus.LOADED
        ? result.preferences
        : undefined;
    },
    givenTwoTabs: () => {
      createChannel = createInMemoryChannelHub().createChannel;
    },
    storePayload: (fields: Record<string, unknown>) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          payload: buildStoredPayload(fields),
        }),
      ),
    storeDocument: (schemaVersion: number, payload: object) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({ schemaVersion, payload }),
      ),
    storedText: () => localStorage.getItem(STORAGE_KEYS.PREFERENCES),
    storedPayload: () =>
      JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) ?? "{}")
        .payload,
    openTab,
    tabs: () => tabs,
    closeTabs: () => {
      act(() => void window.dispatchEvent(new Event(PAGE_HIDE_EVENT)));
      cleanup();
      tabs.length = 0;
    },
    runPendingWrite: (tab = firstTab()) =>
      act(() => tab.writeScheduler.runPending()),
    colouringGroup,
    optionNames: (tab = firstTab()) =>
      within(colouringGroup(tab))
        .getAllByRole("radio")
        .map((radio) => (radio as HTMLInputElement).closest("label")?.title),
    checkedOptionName: (tab = firstTab()) => {
      const checkedRadio = within(colouringGroup(tab))
        .getAllByRole("radio")
        .find((radio) => (radio as HTMLInputElement).checked);
      return checkedRadio?.closest("label")?.title ?? "";
    },
    chooseColouring: (name: string, tab = firstTab()) =>
      userEvent.click(within(colouringGroup(tab)).getByRole("radio", { name })),
    chooseHourFormat: (name: string) =>
      userEvent.click(screen.getByRole("radio", { name })),
    workingHoursRow,
    fieldTexts: (tab = firstTab()) => [
      (field("settings.workingHoursStartLabel", tab) as HTMLInputElement).value,
      (field("settings.workingHoursEndLabel", tab) as HTMLInputElement).value,
    ],
    typeInto: async (
      labelKey: string,
      text: string,
      tab = firstTab(),
    ): Promise<void> => {
      const target = field(labelKey, tab);
      await userEvent.clear(target);
      await userEvent.type(target, text);
    },
    pressInField: (labelKey: string, key: string, tab = firstTab()) => {
      field(labelKey, tab).focus();
      return userEvent.keyboard(key);
    },
    hintText: (tab = firstTab()) =>
      within(workingHoursRow(tab) as HTMLElement).getByRole("status")
        .textContent,
    /** The colours of a city's track stops, from the first render of the tab. */
    trackColours: (city: string, tab = firstTab()): readonly DayColour[] =>
      (
        tab.rows.current.find((row) => row.cityLabel === city)?.dayTrack
          ?.stops ?? []
      ).map((stop) => stop.colour),
    hasUnreadableNote: (tab = firstTab()) =>
      within(tab.container).queryByText(i18n.t("settings.unreadable")) !== null,
  };
};
