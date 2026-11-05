// Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location: the settings page over real preferences storage.
// Implements FR12 of show-zone-abbreviations-and-zone-label-setting: the zone label example reads the list's moment.
import {
  act,
  cleanup,
  render,
  screen,
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
import { SettingsPage } from "@/app/settings";
import { STORAGE_KEYS } from "@/constants";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";

const NOT_JSON = "{not json";
const NO_OP = () => undefined;
const SETTINGS_INSTANT = "2026-07-15T12:00:00Z";

type OpenedSettings = {
  unmount: () => void;
  writeScheduler: ReturnType<typeof createManualWriteScheduler>;
  container: HTMLElement;
};

/** Per-scenario state of the settings features. */
export const createSettingsWorld = () => {
  let storage: Storage = localStorage;
  let createChannel: () => LocationsSyncChannel | undefined = () => undefined;
  const openedPages: OpenedSettings[] = [];

  const openPage = (): OpenedSettings => {
    const writeScheduler = createManualWriteScheduler();
    const repository = createLocalStoragePreferencesRepository({
      getStorage: () => storage,
      createChannel,
    });
    const { unmount, container } = render(
      <PreferencesProvider
        repository={repository}
        writeScheduler={writeScheduler}
      >
        <LocationsProvider
          repository={createInMemoryLocationRepository()}
          writeScheduler={immediateWriteScheduler}
          clock={fakeClock(SETTINGS_INSTANT)}
          tickScheduler={createManualTickScheduler()}
        >
          <SettingsPage notices={null} onBack={NO_OP} />
        </LocationsProvider>
      </PreferencesProvider>,
    );
    const opened = { unmount, writeScheduler, container };
    openedPages.push(opened);
    return opened;
  };

  return {
    reset: async () => {
      cleanup();
      openedPages.length = 0;
      storage = localStorage;
      createChannel = () => undefined;
      localStorage.clear();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    givenNoPreferencesStored: () => localStorage.clear(),
    givenCorruptedPreferences: () =>
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, NOT_JSON),
    givenStorageUnavailable: () => {
      storage = {
        ...localStorage,
        getItem: () => {
          throw new DOMException("denied", "SecurityError");
        },
        setItem: () => {
          throw new DOMException("denied", "SecurityError");
        },
        removeItem: () => {
          throw new DOMException("denied", "SecurityError");
        },
      } as Storage;
    },
    givenTwoTabs: () => {
      createChannel = createInMemoryChannelHub().createChannel;
    },
    openPage,
    openedPages: () => openedPages,
    runPendingWrite: (opened = openedPages[0]) =>
      act(() => opened.writeScheduler.runPending()),
    chooseTheme: (name: string, container?: HTMLElement) =>
      userEvent.click(
        within(container ?? document.body).getByRole("radio", { name }),
      ),
    chooseHourFormat: (name: string, container?: HTMLElement) =>
      userEvent.click(
        within(container ?? document.body).getByRole("radio", { name }),
      ),
    expectThemeChecked: (name: string, container?: HTMLElement) =>
      expect(
        within(container ?? document.body).getByRole("radio", { name }),
      ).toBeChecked(),
    expectHourFormatChecked: (name: string, container?: HTMLElement) =>
      expect(
        within(container ?? document.body).getByRole("radio", { name }),
      ).toBeChecked(),
    storedDocument: () => localStorage.getItem(STORAGE_KEYS.PREFERENCES),
    note: (key: string) => screen.queryByText(i18n.t(key)),
    resetButton: () =>
      screen.getByRole("button", { name: i18n.t("settings.reset") }),
  };
};
