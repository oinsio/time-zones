// Verifies FR1, FR2, FR3, FR4, FR5, FR6, FR8, FR9, FR10, FR12, UX5, NFR-P1 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  createMeetingShareDialogWorld,
  DEVICE_TIME_ENTRY_NAME,
} from "./meetingShareDialogWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../meeting_share_dialog_language_unit.feature",
);

const ENGLISH_SAMPLE_LINES = [
  "Meeting on Sunday, March 8, 2026, 2 h",
  "Almaty (UTC+5): 09:00–11:00",
  "Moscow (MSK, UTC+3): 07:00–09:00",
  "Kolkata (IST, UTC+5:30): 09:30–11:30",
  "New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7)",
];
const CYRILLIC_LETTER = /[Ѐ-ӿ]/;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingShareDialogWorld();
  const { ensureOpen, openTheDialog, choose, closeDialog } = world;
  const dialogIsOpen = () => openTheDialog();
  const whenChoosesShareMeeting = async () => {
    await ensureOpen();
    await world.openDialog();
  };
  void [dialogIsOpen, whenChoosesShareMeeting, closeDialog, choose];

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  f.Background(({ Given, And }) => {
    Given(
      "the interface language is Russian, the hour format is 24-hour and nothing is stored in the preferences",
      () => {},
    );
    And(
      "the Grid view shows the sample meeting 09:00–11:00 in Almaty on 2026-03-08 with the list Almaty, Moscow, Kolkata, New York",
      () => {},
    );
  });

  // @add-meeting-share-dialog @FR4
  f.Scenario("Another share language", ({ Given, Then, And }) => {
    Given(
      "the user chose {string} as the share language",
      async (_ctx, language: string) => {
        await openTheDialog();
        await choose(language);
      },
    );
    Then("the preview is the English text of the sample meeting", async () => {
      await waitFor(() =>
        expect(world.previewLines()).toEqual(ENGLISH_SAMPLE_LINES),
      );
    });
    And(
      "the dialog's captions and rows are still in Russian and the interface language is Russian",
      () => {
        expect(
          screen.getByText(i18n.t("meeting.shareDialogRecipients")),
        ).toBeInTheDocument();
        expect(world.rows()[0].city).toBe("Алматы");
        expect(i18n.language).toBe("ru");
      },
    );
  });

  // @add-meeting-share-dialog @FR4
  f.Scenario(
    "The device time location in another share language",
    ({ Given, And, Then }) => {
      Given(
        "the list is the device time location, Moscow, Kolkata and New York, with no home location",
        () => {
          world.setOptions({
            cities: [DEVICE_TIME_ENTRY_NAME, "Moscow", "Kolkata", "New York"],
          });
        },
      );
      And(
        "the user chose {string} as the share language",
        async (_ctx, language: string) => {
          await openTheDialog();
          await choose(language);
        },
      );
      Then(
        "the first line of the preview after the heading starts with {string} and no line contains a Cyrillic letter",
        async (_ctx, city: string) => {
          await waitFor(() =>
            expect(world.previewLines()[1]).toMatch(new RegExp(`^${city}`)),
          );
          expect(world.previewLines().join("\n")).not.toMatch(CYRILLIC_LETTER);
        },
      );
      And(
        "the first row of the dialog still reads {string}",
        (_ctx, city: string) => {
          expect(world.rows()[0].city).toBe(city);
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR5
  f.Scenario(
    "Without the pin the dialog returns to the interface language",
    ({ Given, When, Then }) => {
      Given(
        "the user chose {string} as the share language and closed the dialog without pinning",
        async (_ctx, language: string) => {
          await openTheDialog();
          await choose(language);
          await closeDialog();
        },
      );
      When("the user chooses {string}", async () => world.openDialog());
      Then("the share language is {string}", (_ctx, language: string) => {
        expect(world.shareLanguageName()).toBe(language);
      });
    },
  );

  // @add-meeting-share-dialog @FR5
  f.Scenario(
    "A pinned language opens every time",
    ({ Given, When, Then, And }) => {
      Given(
        "the user chose {string} as the share language and turned the pin on",
        async (_ctx, language: string) => {
          await openTheDialog();
          await choose(language);
          await world.pin().click();
        },
      );
      When(
        "the app is opened again, a meeting range is set and the share dialog is opened",
        async () => {
          await world.reloadApp();
          await world.openDialog();
        },
      );
      Then(
        "the share language is {string} and {string} is the pinned share language",
        (_ctx, language: string, pinned: string) => {
          expect(world.shareLanguageName()).toBe(language);
          expect(world.shareLanguageName()).toBe(pinned);
          expect(world.pin().getAttribute("aria-pressed")).toBe("true");
        },
      );
      And("the interface language is Russian", () => {
        expect(i18n.language).toBe("ru");
      });
    },
  );

  // @add-meeting-share-dialog @FR5
  f.Scenario("Changing the language while pinned", ({ Given, When, Then }) => {
    Given(
      "the share language {string} is pinned",
      async (_ctx, language: string) => {
        world.storePreferences({ shareLanguage: "en" });
        await openTheDialog();
        expect(world.shareLanguageName()).toBe(language);
      },
    );
    When(
      "the user chooses {string} as the share language",
      (_ctx, language: string) => choose(language),
    );
    Then("the pinned share language is {string}", (_ctx, language: string) => {
      expect(world.shareLanguageName()).toBe(language);
      expect(world.pin().getAttribute("aria-pressed")).toBe("true");
    });
  });

  // @add-meeting-share-dialog @FR5
  f.Scenario("Turning the pin off", ({ Given, When, Then }) => {
    Given(
      "the share language {string} is pinned and the dialog is open",
      async () => {
        world.storePreferences({ shareLanguage: "en" });
        await openTheDialog();
      },
    );
    When("the user turns the pin off", async () => {
      await world.pin().click();
    });
    Then(
      "no share language is pinned and the share language of this dialog is still {string}",
      (_ctx, language: string) => {
        expect(world.pin().getAttribute("aria-pressed")).toBe("false");
        expect(world.shareLanguageName()).toBe(language);
      },
    );
  });
});
