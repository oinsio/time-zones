// Implements FR12, FR13, FR14, FR15 of show-zone-abbreviations-and-zone-label-setting: tabs of the settings page and the rows over real preferences storage.
import { act, cleanup, render, within } from "@testing-library/react/pure";
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
import { LocationsLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, ZoneLabelPart } from "@/preferences";
import { buildLocation } from "@/test/factories/buildLocation";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { readZoneLineElements } from "../../locations/steps/zoneLineQueries";
import { ZONE_LABEL_PART_NAMES } from "../../locations/steps/zoneLineWorld";

const NO_OP = () => undefined;
const INSTANT = "2026-07-15T12:00:00Z";
const PAGE_HIDE_EVENT = "pagehide";
const EXAMPLE_OFFSET = "UTC+5:30";
const EXAMPLE_ABBREVIATION = "IST";

type Tab = {
  container: HTMLElement;
  writeScheduler: ReturnType<typeof createManualWriteScheduler>;
};

/** The list and the settings page side by side, as one tab. */
const TabView = () => {
  const { rows, removeLocation, setHomeLocation, moveLocation } =
    useLocations();
  return (
    <>
      <LocationList
        rows={rows}
        onRemove={removeLocation}
        onSetHome={setHomeLocation}
        onMove={moveLocation}
        onSelectTrackFraction={NO_OP}
        onMoveTrack={NO_OP}
        onConfirmWallTime={ignoreWallTime}
      />
      <SettingsPage notices={null} onBack={NO_OP} />
    </>
  );
};

/** Per-scenario state of the zone label settings features. */
export const createZoneLabelWorld = () => {
  let cityLabels: string[] = [];
  let createChannel: () => LocationsSyncChannel | undefined = () => undefined;
  const tabs: Tab[] = [];

  const openTab = (): Tab => {
    const container = document.body.appendChild(document.createElement("div"));
    const writeScheduler = createManualWriteScheduler();
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
          <TabView />
        </LocationsProvider>
      </PreferencesProvider>,
      { container },
    );
    const tab = { container, writeScheduler };
    tabs.push(tab);
    return tab;
  };
  const zoneLabelGroup = (tab = tabs[0] as Tab) =>
    within(tab.container).getByRole("group", {
      name: i18n.t("settings.zoneLabelLabel"),
    });
  const toggleOf = (name: string, tab = tabs[0] as Tab) =>
    within(zoneLabelGroup(tab)).getByRole("button", { name });
  const rowsOf = (tab = tabs[0] as Tab) =>
    within(tab.container).getAllByRole("listitem");

  return {
    reset: async () => {
      cleanup();
      tabs.length = 0;
      cityLabels = [];
      createChannel = () => undefined;
      localStorage.clear();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    setLanguage: async (language: string) => {
      await i18n.changeLanguage(language);
    },
    setList: (...cities: string[]) => {
      cityLabels = cities;
    },
    storeZoneLabel: (partsName: keyof typeof ZONE_LABEL_PART_NAMES) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          payload: {
            theme: DEFAULT_PREFERENCES.theme,
            hourFormat: DEFAULT_PREFERENCES.hourFormat,
            interfaceLanguage: DEFAULT_PREFERENCES.interfaceLanguage,
            zoneLabelParts: ZONE_LABEL_PART_NAMES[partsName],
          },
        }),
      ),
    storeRaw: (documentText: string) =>
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, documentText),
    storedText: () => localStorage.getItem(STORAGE_KEYS.PREFERENCES),
    storedZoneLabelParts: (): readonly ZoneLabelPart[] =>
      JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) ?? "{}").payload
        .zoneLabelParts,
    givenTwoTabs: () => {
      createChannel = createInMemoryChannelHub().createChannel;
    },
    openTab,
    openedTabs: () => tabs,
    /** Closes the tab the way the browser does, flushing a pending write. */
    closeTabs: () => {
      act(() => void window.dispatchEvent(new Event(PAGE_HIDE_EVENT)));
      cleanup();
      tabs.length = 0;
    },
    runPendingWrite: (tab = tabs[0] as Tab) =>
      act(() => tab.writeScheduler.runPending()),
    toggle: (name: string, tab?: Tab) => userEvent.click(toggleOf(name, tab)),
    /** The example under the toggles, as zone line elements. */
    exampleOf: (tab = tabs[0] as Tab) =>
      readZoneLineElements(zoneLabelGroup(tab)),
    /**
     * The zone label in force, read from the example it shows (never from
     * `aria-pressed`, which belongs to the E2E scenario of the accessible names).
     */
    shownZoneLabel: (tab = tabs[0] as Tab) => {
      const example = readZoneLineElements(zoneLabelGroup(tab));
      const parts = [
        ...(example.includes(EXAMPLE_OFFSET) ? [ZoneLabelPart.UTC_OFFSET] : []),
        ...(example.includes(EXAMPLE_ABBREVIATION)
          ? [ZoneLabelPart.ZONE_ABBREVIATION]
          : []),
      ];
      return Object.entries(ZONE_LABEL_PART_NAMES).find(
        ([, candidate]) => candidate.join() === parts.join(),
      )?.[0];
    },
    rowZoneLine: (city: string, tab = tabs[0] as Tab) =>
      readZoneLineElements(
        rowsOf(tab).find((row) =>
          row.textContent?.startsWith(city),
        ) as HTMLElement,
      ),
    allRowsZoneLines: (tab = tabs[0] as Tab) =>
      rowsOf(tab).map(readZoneLineElements),
  };
};
