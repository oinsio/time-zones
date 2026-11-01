// Implements FR5, FR7, FR8, FR12 of add-interface-language-selection: the real AppShell over real preferences storage.
import {
  act,
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { vi } from "vitest";
import { createLocalStoragePreferencesRepository } from "@/adapters";
import { AppShell } from "@/app";
import {
  LEGACY_STORAGE_KEYS,
  LOCATIONS_SCHEMA_VERSION,
  STORAGE_KEYS,
} from "@/constants";
import { resolveStartInterfaceLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";

const NOT_JSON = "{not json";
const PAGE_HIDE_EVENT_NAME = "pagehide";

/** Per-scenario state of the interface language features. */
export const createSettingsLanguageWorld = () => {
  let instant = "2026-03-08T07:30:00Z";
  const rendered: { unmount: () => void }[] = [];

  const settingsButtonName = () => i18n.t("settings.open");
  const languageButton = () =>
    screen.getByRole("button", {
      name: new RegExp(
        `^${i18n.t("settings.languageButton", { language: ".*" })}`,
      ),
    });

  const openApp = () => {
    rendered.push(
      render(createElement(AppShell, { clock: fakeClock(instant) })),
    );
  };

  return {
    reset: async () => {
      act(() => void window.dispatchEvent(new Event(PAGE_HIDE_EVENT_NAME)));
      cleanup();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      rendered.length = 0;
      instant = "2026-03-08T07:30:00Z";
      localStorage.clear();
      stubZoneCitiesFetch();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      await i18n.changeLanguage("ru");
    },
    setInstant: (isoInstant: string) => {
      instant = isoInstant;
    },
    setBrowserLanguage: (language: string) => {
      vi.spyOn(navigator, "languages", "get").mockReturnValue([language]);
      vi.spyOn(navigator, "language", "get").mockReturnValue(language);
    },
    storeAlmatyList: () =>
      localStorage.setItem(
        STORAGE_KEYS.LOCATIONS,
        JSON.stringify({
          schemaVersion: LOCATIONS_SCHEMA_VERSION,
          payload: {
            locations: [
              {
                kind: "CITY",
                timeZoneId: "Asia/Almaty",
                label: "Almaty",
                countryCode: "KZ",
              },
            ],
            homeLocationId: null,
          },
        }),
      ),
    storePreferences: (schemaVersion: number, payload: object) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({ schemaVersion, payload }),
      ),
    storeChosenLanguage: (interfaceLanguage: string) =>
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          schemaVersion: 2,
          payload: { ...DEFAULT_PREFERENCES, interfaceLanguage },
        }),
      ),
    storeLegacyLanguage: (language: string) =>
      localStorage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, language),
    storeCorruptedPreferences: () =>
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, NOT_JSON),
    makeStorageUnavailable: () => {
      const denied = () => {
        throw new DOMException("denied", "SecurityError");
      };
      vi.spyOn(localStorage, "setItem").mockImplementation(denied);
      vi.spyOn(localStorage, "removeItem").mockImplementation(denied);
    },
    openApp,
    /** A page load: the start language is resolved from storage, then the app renders. */
    reopenApp: async () => {
      cleanup();
      await i18n.changeLanguage(resolveStartInterfaceLanguage());
      openApp();
    },
    openSettings: async () => {
      await userEvent.click(
        screen.getByRole("button", { name: settingsButtonName() }),
      );
      await screen.findByRole("heading", { name: i18n.t("settings.title") });
    },
    goBack: () =>
      userEvent.click(
        screen.getByRole("button", { name: i18n.t("settings.back") }),
      ),
    expandLanguageGroup: () => userEvent.click(languageButton()),
    languageButton,
    languageRows: () => within(screen.getByRole("list")).getAllByRole("button"),
    chooseLanguage: async (nativeName: string) => {
      await userEvent.click(languageButton());
      await userEvent.click(
        within(screen.getByRole("list")).getByRole("button", {
          name: nativeName,
        }),
      );
    },
    chooseHourFormat: (name: string) =>
      userEvent.click(screen.getByRole("radio", { name })),
    resetSettings: () =>
      userEvent.click(
        screen.getByRole("button", { name: i18n.t("settings.reset") }),
      ),
    /** The page-hide flush of the pending debounced write. */
    flushWrites: () =>
      act(() => void window.dispatchEvent(new Event(PAGE_HIDE_EVENT_NAME))),
    storedPreferencesPayload: () => {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return stored === null ? null : JSON.parse(stored).payload;
    },
    hasStoredPreferences: () =>
      localStorage.getItem(STORAGE_KEYS.PREFERENCES) !== null,
    hasLegacyLanguage: () =>
      localStorage.getItem(LEGACY_STORAGE_KEYS.LANGUAGE) !== null,
    /** Another tab: a second repository on the same storage saves a change. */
    saveFromAnotherTab: (interfaceLanguage: string) =>
      act(async () => {
        createLocalStoragePreferencesRepository({
          getStorage: () => localStorage,
        }).save({ ...DEFAULT_PREFERENCES, interfaceLanguage });
        // The broadcast message reaches the open tab on the next task.
        await new Promise((resolve) => setTimeout(resolve, 0));
      }),
  };
};
