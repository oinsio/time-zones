// Verifies FR5, FR6 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, screen, waitFor, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  PREFERENCES_SCHEMA_VERSION,
  PREFERENCES_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { ViewId } from "@/views";
import { createMeetingShareDialogWorld } from "../../meeting_share_dialog/steps/meetingShareDialogWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_share_preferences_unit.feature");

const PREVIOUS_SCHEMA_VERSION = 7;
const ABBREVIATION = "Аббревиатура";
const UTC_OFFSET = "Смещение UTC";
const COUNTRY = "Страна";
const PIN_ENGLISH = { shareLanguage: "en" } as const;
const FIELD_KEYS = {
  "share zone label": "shareZoneLabelParts",
  "pinned share language": "shareLanguage",
} as const;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingShareDialogWorld();
  let storedDocument: string | null = null;
  const storeDocument = (schemaVersion: number, payload: object) =>
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({ schemaVersion, payload }),
    );
  const currentPayload = (overrides: object) => ({
    ...DEFAULT_PREFERENCES,
    viewMode: ViewId.GRID,
    interfaceLanguage: "ru",
    ...overrides,
  });
  const openSettings = async () => {
    await userEvent.click(
      await screen.findByRole("button", { name: i18n.t("settings.open") }),
    );
    await screen.findByRole("heading", { name: i18n.t("settings.title") });
  };
  const openStoredApp = async (isMeetingSkipped = false) => {
    world.setOptions({ keepStoredPreferences: true, isMeetingSkipped });
    await world.ensureOpen();
  };

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  f.Background(({ Given }) => {
    Given(
      "the interface language is Russian and the Grid view shows the sample meeting",
      () => {},
    );
  });

  // @add-meeting-share-dialog @FR5
  f.Scenario(
    "The pinned share language survives a reload",
    ({ Given, When, Then }) => {
      Given("the user pinned the share language {string}", async () => {
        await world.openTheDialog();
        await world.choose("English");
        await world.pin().click();
      });
      When("the app is opened again", async () => {
        await world.reloadApp();
        await world.openDialog();
      });
      Then(
        "the pinned share language is {string} and the interface language is Russian",
        (_ctx, language: string) => {
          expect(world.shareLanguageName()).toBe(language);
          expect(world.pin().getAttribute("aria-pressed")).toBe("true");
          expect(i18n.language).toBe("ru");
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR6
  f.Scenario(
    "The share zone label survives a reload",
    ({ Given, When, Then, And }) => {
      Given(
        "the user turned the UTC offset of the share zone label off",
        async () => {
          await world.openTheDialog();
          await world.toggleZoneLabelPart(UTC_OFFSET);
        },
      );
      When("the app is opened again", async () => {
        await world.reloadApp();
        await world.openDialog();
      });
      Then("the share zone label shows the zone abbreviation only", () => {
        expect(world.zoneLabelPartIsOn(ABBREVIATION)).toBe(true);
        expect(world.zoneLabelPartIsOn(UTC_OFFSET)).toBe(false);
      });
      And(
        "the zone label setting still shows the country, the zone abbreviation and the UTC offset",
        async () => {
          await world.closeDialog();
          await userEvent.click(
            screen.getByRole("button", { name: i18n.t("meeting.clear") }),
          );
          await openSettings();
          const group = screen.getByRole("group", {
            name: i18n.t("settings.zoneLabelLabel"),
          });
          for (const name of [COUNTRY, ABBREVIATION, UTC_OFFSET]) {
            expect(
              within(group)
                .getByRole("button", { name })
                .getAttribute("aria-pressed"),
            ).toBe("true");
          }
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR5 @FR6
  f.Scenario("Existing users get the defaults", ({ Given, When, Then }) => {
    Given(
      "a stored preferences document of the previous version with the theme Dark and the interface language Russian",
      () => {
        const {
          shareLanguage: _language,
          shareZoneLabelParts: _parts,
          ...previous
        } = currentPayload({ theme: "DARK" });
        storeDocument(PREVIOUS_SCHEMA_VERSION, previous);
      },
    );
    When("the app is opened", () => openStoredApp());
    Then(
      "no share language is pinned, the share zone label shows the zone abbreviation and the UTC offset, the theme is Dark and the interface language is Russian",
      async () => {
        await world.openDialog();
        expect(world.pin().getAttribute("aria-pressed")).toBe("false");
        expect([ABBREVIATION, UTC_OFFSET].map(world.zoneLabelPartIsOn)).toEqual(
          [true, true],
        );
        expect(document.documentElement.getAttribute("data-theme")).toBe(
          "dark",
        );
        expect(i18n.language).toBe("ru");
      },
    );
  });

  // @add-meeting-share-dialog @FR5 @FR6
  f.ScenarioOutline(
    "Unreadable share choices",
    ({ Given, When, Then }, variables) => {
      Given(
        "a stored preferences document of the current version whose <field> is <value>",
        () => {
          const key = FIELD_KEYS[variables.field as keyof typeof FIELD_KEYS];
          storeDocument(
            PREFERENCES_SCHEMA_VERSION,
            currentPayload({ [key]: JSON.parse(variables.value) }),
          );
        },
      );
      When("the app is opened", () => openStoredApp(true));
      Then("the unreadable preferences note with Reset is shown", async () => {
        await openSettings();
        expect(
          screen.getByText(i18n.t("settings.unreadable")),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: i18n.t("settings.reset") }),
        ).toBeInTheDocument();
      });
    },
  );

  // @add-meeting-share-dialog @FR5
  f.Scenario(
    "A pinned language that the app no longer has",
    ({ Given, When, Then }) => {
      Given(
        "a stored preferences document whose pinned share language is {string}, which the locale registry does not have",
        (_ctx, tag: string) => {
          storeDocument(
            PREFERENCES_SCHEMA_VERSION,
            currentPayload({ shareLanguage: tag }),
          );
        },
      );
      When("the app is opened", () => openStoredApp());
      Then(
        "no share language is pinned and no unreadable note is shown",
        async () => {
          await world.openDialog();
          expect(world.pin().getAttribute("aria-pressed")).toBe("false");
          expect(world.shareLanguageName()).toBe("Русский");
          expect(screen.queryByText(i18n.t("settings.unreadable"))).toBeNull();
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR5
  f.Scenario(
    "Another tab changes the share choices",
    ({ Given, When, Then }) => {
      Given("the app is open", () => world.ensureOpen());
      When("another tab pins the share language {string}", () => {
        storeDocument(PREFERENCES_SCHEMA_VERSION, currentPayload(PIN_ENGLISH));
        const anotherTab = new BroadcastChannel(PREFERENCES_SYNC_CHANNEL_NAME);
        anotherTab.postMessage("changed");
        anotherTab.close();
      });
      Then(
        "this tab has the pinned share language {string} without a reload",
        async (_ctx, language: string) => {
          await world.openDialog();
          await waitFor(() => expect(world.shareLanguageName()).toBe(language));
          expect(world.pin().getAttribute("aria-pressed")).toBe("true");
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR5 @FR6
  f.Scenario("Nothing is written before a change", ({ Given, When, Then }) => {
    Given("a device with no stored preferences except the Grid view", () => {
      storeDocument(PREFERENCES_SCHEMA_VERSION, currentPayload({}));
      storedDocument = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      world.setOptions({ keepStoredPreferences: true });
    });
    When(
      "the user opens the share dialog and closes it without changing a choice",
      async () => {
        await world.openTheDialog();
        await world.closeDialog();
        act(() => void window.dispatchEvent(new Event("pagehide")));
      },
    );
    Then("the stored preferences document is as it was", () => {
      expect(localStorage.getItem(STORAGE_KEYS.PREFERENCES)).toBe(
        storedDocument,
      );
    });
  });
});
