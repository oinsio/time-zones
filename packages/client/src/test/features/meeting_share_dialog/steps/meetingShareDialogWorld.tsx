// Implements FR1-FR6, FR8-FR10 of add-meeting-share-dialog: the real app with the share dialog over stored choices.
import { cleanup, screen, waitFor, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { createInMemoryTextSharing } from "@/adapters";
import {
  LOCATIONS_SCHEMA_VERSION,
  LOCATIONS_SYNC_CHANNEL_NAME,
  PREFERENCES_SCHEMA_VERSION,
  STORAGE_KEYS,
} from "@/constants";
import { LocationKind } from "@/model";
import { DEFAULT_PREFERENCES, type Preferences } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { ViewId } from "@/views";
import { setSampleMeeting } from "../../grid_view/steps/meetingGridQueries";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createGridViewWorld } from "../../main_page/steps/gridViewWorld";

export const DEVICE_TIME_ENTRY_NAME = "Device time";
export const SAMPLE_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
export const MORE_CITIES = Object.keys(KNOWN_CITIES).filter(
  (city) => !SAMPLE_CITIES.includes(city) && /^[A-Z]/.test(city),
);
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
const ALMATY_ZONE = "Asia/Almaty";
const PAGE_HIDE_EVENT_NAME = "pagehide";
const CROSS_TAB_MESSAGE = "changed";
const SHARE_MEETING_BUTTON = "Поделиться встречей";
const LEADING_DOT = /^[\s·]+/;
const ZONE_PART_SELECTOR = "[data-zone-line-part]";

export type DialogRow = {
  city: string;
  zoneParts: string;
  span: string;
  date: string;
  isTicked: boolean;
};

export type OpenOptions = {
  cities?: string[];
  homeCity?: string;
  language?: string;
  /** Keeps the preferences the app saved instead of writing the scenario's. */
  keepStoredPreferences?: boolean;
  /** Opens the app without picking a meeting, as the settings page needs. */
  isMeetingSkipped?: boolean;
  preferences?: Partial<Preferences>;
  sharing?: Parameters<typeof createInMemoryTextSharing>[0];
};

/** The real app, the share dialog and the text sharing of one scenario. */
export const createMeetingShareDialogWorld = () => {
  const gridWorld = createGridViewWorld();
  let sharing = createInMemoryTextSharing({ canShare: true, canCopy: true });
  let preferences: Partial<Preferences> = {};
  let options: OpenOptions = {};
  let isOpen = false;

  const storeLocations = (cities: string[], homeCity?: string) =>
    localStorage.setItem(
      STORAGE_KEYS.LOCATIONS,
      JSON.stringify({
        schemaVersion: LOCATIONS_SCHEMA_VERSION,
        payload: {
          locations: cities.map((city) =>
            city === DEVICE_TIME_ENTRY_NAME
              ? { kind: LocationKind.DEVICE_TIME }
              : cityEntry(city),
          ),
          homeLocationId:
            homeCity === undefined
              ? null
              : buildLocation(cityEntry(homeCity)).id,
        },
      }),
    );
  const storePreferences = (language: string) =>
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        payload: {
          ...DEFAULT_PREFERENCES,
          viewMode: ViewId.GRID,
          interfaceLanguage: language,
          ...preferences,
        },
      }),
    );
  const dialog = () =>
    screen.getByRole("dialog", { name: i18n.t("meeting.shareDialogTitle") });
  const flushWrites = () =>
    window.dispatchEvent(new Event(PAGE_HIDE_EVENT_NAME));

  const world = {
    reset: async () => {
      await gridWorld.reset();
      sharing = createInMemoryTextSharing({ canShare: true, canCopy: true });
      preferences = {};
      options = {};
      isOpen = false;
      await i18n.changeLanguage("ru");
    },
    setOptions: (next: OpenOptions) => {
      options = { ...options, ...next };
    },
    /** Opens the app once per scenario, with the options the Given steps set. */
    ensureOpen: async () => {
      if (isOpen) return;
      isOpen = true;
      await world.openAppWithMeeting(options);
    },
    /** Opens the app if needed, then the dialog, once the first row has its Russian city label. */
    openTheDialog: async () => {
      await world.ensureOpen();
      await world.openDialog();
      await waitFor(() => expect(world.rows()[0].city).toBe("Алматы"));
    },
    closeDialog: () => world.closeDialogWithButton(),
    choose: async (language: string) => {
      await world.chooseShareLanguage(language);
      await waitFor(() => expect(world.shareLanguageName()).toBe(language));
    },
    finish: gridWorld.finish,
    getSharing: () => sharing,
    useSharing: (options: NonNullable<OpenOptions["sharing"]>) => {
      sharing = createInMemoryTextSharing(options);
    },
    storePreferences: (overrides: Partial<Preferences>) => {
      preferences = { ...preferences, ...overrides };
    },
    /** Opens the app with the sample meeting set; the dialog stays closed. */
    openAppWithMeeting: async ({
      cities = SAMPLE_CITIES,
      homeCity,
      language = "ru",
      keepStoredPreferences = false,
      isMeetingSkipped = false,
    }: OpenOptions = {}) => {
      gridWorld.setInstant(SAMPLE_INSTANT);
      gridWorld.setDeviceZone(ALMATY_ZONE);
      if (!keepStoredPreferences) storePreferences(language);
      storeLocations(cities, homeCity);
      await i18n.changeLanguage(language);
      await gridWorld.openApp(sharing);
      await screen.findAllByRole("slider");
      if (!isMeetingSkipped) setSampleMeeting();
    },
    openDialog: async (name = SHARE_MEETING_BUTTON) => {
      await userEvent.click(await screen.findByRole("button", { name }));
      await screen.findByRole("dialog", { name });
    },
    shareButtonLabel: () =>
      Array.from(dialog().querySelectorAll("button"))
        .map((button) => button.textContent)
        .find((label) => label === i18n.t("meeting.shareDialogShare")),
    /** Twenty distinct sample cities, the sample four first. */
    manyCities: (count: number) =>
      [...SAMPLE_CITIES, ...MORE_CITIES].slice(0, count),
    /** The meeting bar, with its Clear meeting button, is shown while a meeting range is set. */
    isMeetingBarShown: () =>
      screen.queryByRole("button", {
        name: i18n.t("meeting.clear"),
        hidden: true,
      }) !== null,
    isDialogOpen: () => screen.queryByRole("dialog") !== null,
    closeDialogWithButton: () =>
      userEvent.click(
        within(dialog()).getByRole("button", {
          name: i18n.t("locations.close"),
        }),
      ),
    closeDialogWithEscape: () => userEvent.keyboard("{Escape}"),
    dialogTitle: () => within(dialog()).getByText(/^Встреча · /).textContent,
    referenceLine: () =>
      within(dialog()).getByText(/ · по времени /).textContent,
    rows: (): DialogRow[] =>
      within(dialog())
        .getAllByRole("checkbox")
        .map((checkbox) => {
          const row = checkbox.closest("li") as HTMLElement;
          const text = (selector: string) =>
            row.querySelector(selector)?.textContent ?? "";
          return {
            city: checkbox.getAttribute("aria-labelledby")
              ? (document.getElementById(
                  checkbox.getAttribute("aria-labelledby") as string,
                )?.textContent ?? "")
              : "",
            zoneParts: Array.from(row.querySelectorAll(ZONE_PART_SELECTOR))
              .map((part) => (part.textContent ?? "").replace(LEADING_DOT, ""))
              .join(" · "),
            span: text("[data-share-row-span]"),
            date: text("[data-share-row-date]"),
            isTicked: (checkbox as HTMLInputElement).checked,
          };
        }),
    toggleRow: (city: string) =>
      userEvent.click(within(dialog()).getByRole("checkbox", { name: city })),
    previewLines: () =>
      Array.from(
        within(
          within(dialog()).getByRole("region", {
            name: i18n.t("meeting.shareDialogPreview"),
          }),
        ).getAllByText(/./),
      )
        .map((line) => line.textContent ?? "")
        .filter((line) => line !== i18n.t("meeting.shareDialogPreview")),
    shareLanguageName: () =>
      within(dialog())
        .getByRole("button", { name: /^Язык приглашения: / })
        .getAttribute("aria-label")
        ?.replace("Язык приглашения: ", ""),
    chooseShareLanguage: async (nativeName: string) => {
      await userEvent.click(
        within(dialog()).getByRole("button", { name: /^Язык приглашения: / }),
      );
      await userEvent.click(
        within(dialog()).getByRole("button", { name: new RegExp(nativeName) }),
      );
    },
    pin: () =>
      within(dialog()).getByRole("button", {
        name: i18n.t("meeting.shareDialogPin"),
      }),
    toggleZoneLabelPart: (name: string) =>
      userEvent.click(within(dialog()).getByRole("button", { name })),
    zoneLabelPartIsOn: (name: string) =>
      within(dialog())
        .getByRole("button", { name })
        .getAttribute("aria-pressed") === "true",
    chooseShare: () =>
      userEvent.click(
        within(dialog()).getByRole("button", {
          name: i18n.t("meeting.shareDialogShare"),
        }),
      ),
    /** Closes the app as a reload does, flushing the debounced writes. */
    reloadApp: async (language = "ru", isMeetingSkipped = false) => {
      flushWrites();
      cleanup();
      await world.openAppWithMeeting({
        language,
        keepStoredPreferences: true,
        isMeetingSkipped,
      });
    },
    /** Another tab writes the stored list and tells this one. */
    changeListInAnotherTab: async (cities: string[], homeCity?: string) => {
      storeLocations(cities, homeCity);
      const anotherTab = new BroadcastChannel(LOCATIONS_SYNC_CHANNEL_NAME);
      anotherTab.postMessage(CROSS_TAB_MESSAGE);
      anotherTab.close();
    },
    waitForRows: (cities: string[]) =>
      waitFor(() =>
        expect(world.rows().map((row) => row.city)).toEqual(cities),
      ),
  };
  return world;
};
