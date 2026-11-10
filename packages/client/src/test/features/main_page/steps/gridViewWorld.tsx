// Implements FR4, FR7 of add-view-mode-setting-and-grid-skeleton: the real AppShell over the stored view mode.
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
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import {
  PREFERENCES_SCHEMA_VERSION,
  PREFERENCES_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import type { TextSharing } from "@/ports";
import { DEFAULT_PREFERENCES, type Preferences } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import {
  createSwitchableClock,
  type SwitchableClock,
} from "@/test/switchableClock";
import { ViewId } from "@/views";
import { getCardOf } from "../../locations/steps/deviceTimeQueries";
import {
  NOT_JSON,
  seedStoredList,
} from "../../locations/steps/locationsUiWorld";

const DEFAULT_INSTANT = "2026-03-08T07:30:00Z";
const PAGE_HIDE_EVENT_NAME = "pagehide";
const CROSS_TAB_MESSAGE = "changed";
const CARD_ROW_VARIANT = "card";
const DEFAULT_DEVICE_ZONE = "UTC";

const storePreferences = (overrides: Partial<Preferences>) =>
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, ...overrides },
    }),
  );

/** Per-scenario state of the Grid view features. */
export const createGridViewWorld = () => {
  let instant = DEFAULT_INSTANT;
  let deviceZone = DEFAULT_DEVICE_ZONE;
  let clock: SwitchableClock | undefined;

  const wallTimeButtonOf = (city: string) =>
    within(getCardOf(city)).getByRole("button", { name: /^Enter time/ });

  return {
    reset: async () => {
      act(() => void window.dispatchEvent(new Event(PAGE_HIDE_EVENT_NAME)));
      cleanup();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      localStorage.clear();
      instant = DEFAULT_INSTANT;
      deviceZone = DEFAULT_DEVICE_ZONE;
      clock = undefined;
      stubZoneCitiesFetch();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    setInstant: (isoInstant: string) => {
      instant = isoInstant;
    },
    /** Implements FR8, FR9 of add-grid-hour-cells-and-hour-frame: the reference zone of the open app. */
    setDeviceZone: (zoneId: string) => {
      deviceZone = zoneId;
    },
    /** Moves the clock of the open app and lets the live tick notice it. */
    moveClockTo: (isoInstant: string) => {
      clock?.moveTo(isoInstant);
      act(() => void document.dispatchEvent(new Event("visibilitychange")));
    },
    storeViewMode: (viewMode: string | null) => storePreferences({ viewMode }),
    /** Implements FR13 of add-grid-meeting-range-and-share: the stored interface language of the open app; FR4 of fix-grid-meeting-range-lock-and-layering: its hour format. */
    storeViewModeAndLanguage: (
      viewMode: string | null,
      interfaceLanguage: InterfaceLanguageCode,
      hourFormat: Preferences["hourFormat"] = DEFAULT_PREFERENCES.hourFormat,
    ) => storePreferences({ viewMode, interfaceLanguage, hourFormat }),
    /** Implements FR1, FR2 of fix-grid-meeting-range-lock-and-layering: another tab saves the view mode while a meeting bar hides the settings button. */
    receiveCardsViewFromAnotherTab: async (
      interfaceLanguage: InterfaceLanguageCode,
    ) => {
      storePreferences({ viewMode: ViewId.CARDS, interfaceLanguage });
      const anotherTab = new BroadcastChannel(PREFERENCES_SYNC_CHANNEL_NAME);
      anotherTab.postMessage(CROSS_TAB_MESSAGE);
      anotherTab.close();
      await waitFor(() =>
        expect(
          document.querySelector(`[data-row-variant="${CARD_ROW_VARIANT}"]`),
        ).not.toBeNull(),
      );
    },
    storeLocations: (cities: string[]) => seedStoredList(cities),
    storeEmptyList: () => seedStoredList([]),
    storeUnreadableList: () =>
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, NOT_JSON),
    /** `textSharing` replaces the browser's sharing (FR15 of add-grid-meeting-range-and-share). */
    openApp: async (textSharing?: TextSharing) => {
      clock = createSwitchableClock(instant, deviceZone);
      render(createElement(AppShell, { clock, textSharing }));
      await screen.findByRole("main");
    },
    typeTime: async (city: string, text: string) => {
      await userEvent.click(wallTimeButtonOf(city));
      await userEvent.type(
        screen.getByRole("textbox"),
        `{Control>}a{/Control}${text}{Enter}`,
      );
    },
    timesOfRows: () =>
      ["Almaty", "Moscow"].map((city) => wallTimeButtonOf(city).textContent),
    timeOf: (city: string) => wallTimeButtonOf(city).textContent,
    isoDateOf: (city: string) =>
      getCardOf(city).querySelector("time")?.getAttribute("datetime"),
    showNextDay: () =>
      userEvent.click(
        screen.getByRole("button", { name: i18n.t("date.nextDay") }),
      ),
    chooseViewInSettings: async (viewName: string) => {
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("settings.open") }),
      );
      await screen.findByRole("heading", { name: i18n.t("settings.title") });
      await userEvent.click(screen.getByRole("radio", { name: viewName }));
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("settings.back") }),
      );
    },
    cityCaptionsOfRows: () =>
      screen
        .getAllByRole("listitem")
        .map((row) =>
          within(row).getByRole("button", { name: /^Actions for / }),
        )
        .map((menuButton) => menuButton.getAttribute("aria-label") ?? ""),
  };
};
