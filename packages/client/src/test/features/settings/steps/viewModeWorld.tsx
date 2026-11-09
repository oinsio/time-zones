// Implements FR2, FR3, FR4 of add-view-mode-setting-and-grid-skeleton: tabs of the main page view and the settings page over real preferences storage.
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import {
  createInMemoryLocationRepository,
  createLocalStoragePreferencesRepository,
  type LocationsSyncChannel,
} from "@/adapters";
import { ViewHost } from "@/app";
import { SettingsPage } from "@/app/settings";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { buildLocation } from "@/test/factories/buildLocation";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import { registryOverride } from "@/test/registryOverride";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { buildTextView } from "@/test/viewFixtures";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { viewRegistry } from "@/views";
import { cityEntry } from "../../locations/steps/locationsUiWorld";

const NO_OP = () => undefined;
const INSTANT = "2026-07-15T12:00:00Z";
const PAGE_HIDE_EVENT = "pagehide";
const VIEW_ID_ATTRIBUTE = "data-view-id";
const SAMPLE_VIEW_ID = "sample";
const SAMPLE_TITLE_KEY = "views.sampleTitle";

type Tab = {
  container: HTMLElement;
  writeScheduler: ReturnType<typeof createManualWriteScheduler>;
};

/** Per-scenario state of the view mode settings features. */
export const createViewModeWorld = () => {
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
          <ViewHost />
          <SettingsPage notices={null} onBack={NO_OP} />
        </LocationsProvider>
      </PreferencesProvider>,
      { container },
    );
    const tab = { container, writeScheduler };
    tabs.push(tab);
    return tab;
  };
  const viewGroup = (tab = tabs[0] as Tab) =>
    within(tab.container).getByRole("radiogroup", {
      name: i18n.t("settings.viewModeLabel"),
    });
  const optionNames = (tab = tabs[0] as Tab) =>
    within(viewGroup(tab))
      .getAllByRole("radio")
      .map((radio) => radio.closest("label")?.textContent);

  return {
    reset: async () => {
      cleanup();
      tabs.length = 0;
      cityLabels = [];
      createChannel = () => undefined;
      registryOverride.views = undefined;
      localStorage.clear();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      registryOverride.views = undefined;
      await i18n.changeLanguage("ru");
    },
    setList: (...cities: string[]) => {
      cityLabels = cities;
    },
    storePreferences: (schemaVersion: number, payload: object) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({ schemaVersion, payload }),
      ),
    storeViewMode: (viewMode: unknown) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          payload: { ...DEFAULT_PREFERENCES, viewMode },
        }),
      ),
    storedDocument: () => localStorage.getItem(STORAGE_KEYS.PREFERENCES),
    storedViewMode: () =>
      JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) ?? "{}").payload
        ?.viewMode,
    addSampleView: async () => {
      i18n.addResource("en", "translation", SAMPLE_TITLE_KEY, "Sample");
      registryOverride.views = [
        ...viewRegistry,
        {
          ...buildTextView(SAMPLE_VIEW_ID, "sample view"),
          titleKey: SAMPLE_TITLE_KEY,
        },
      ];
    },
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
    chooseView: (name: string, tab = tabs[0] as Tab) =>
      userEvent.click(within(viewGroup(tab)).getByRole("radio", { name })),
    optionNames,
    checkedOptionName: (tab = tabs[0] as Tab) =>
      within(viewGroup(tab))
        .getAllByRole("radio")
        .find((radio) => (radio as HTMLInputElement).checked)
        ?.closest("label")?.textContent,
    /** The id of the view the tab shows, once it has loaded. */
    shownViewId: async (tab = tabs[0] as Tab) => {
      await waitFor(() =>
        expect(tab.container.querySelector("[aria-busy]")).toBeNull(),
      );
      return tab.container
        .querySelector(`[${VIEW_ID_ATTRIBUTE}]`)
        ?.getAttribute(VIEW_ID_ATTRIBUTE);
    },
    /** The names of the rows the shown view lists, in order. */
    rowNames: (tab = tabs[0] as Tab) =>
      within(
        tab.container.querySelector(`[${VIEW_ID_ATTRIBUTE}]`) as HTMLElement,
      )
        .getAllByRole("listitem")
        .map(
          (row) =>
            within(row)
              .getByRole("button", { name: /^Actions for / })
              .getAttribute("aria-label") ?? "",
        ),
    /** The label of the checked option of the group with this caption. */
    checkedOptionOf: (caption: string, tab = tabs[0] as Tab) =>
      within(within(tab.container).getByRole("radiogroup", { name: caption }))
        .getAllByRole("radio")
        .find((radio) => (radio as HTMLInputElement).checked)
        ?.closest("label")
        ?.getAttribute("title"),
    /** The labels of the pressed toggles of the group with this caption. */
    pressedTogglesOf: (caption: string, tab = tabs[0] as Tab) =>
      within(within(tab.container).getByRole("group", { name: caption }))
        .getAllByRole("button", { pressed: true })
        .map((toggle) => toggle.textContent),
    hasNoteWithReset: () =>
      screen.queryByText(i18n.t("settings.unreadable")) !== null &&
      screen.queryByRole("button", { name: i18n.t("settings.reset") }) !== null,
  };
};
