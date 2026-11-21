// Verifies FR1, FR2, FR3, FR4, FR5, FR6, FR8, FR9, FR10, FR12, UX5, NFR-P1 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  createMeetingShareDialogWorld,
  SAMPLE_CITIES,
} from "./meetingShareDialogWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../meeting_share_dialog_unit.feature");

const SHARE_MEETING = "Поделиться встречей";
const BEHAVIOURS = {
  "shares the text": { canShare: true, canCopy: true },
  "reports that the user closed the sheet": {
    canShare: true,
    isCancelled: true,
    canCopy: true,
  },
  "has no system share": { canShare: false, canCopy: true },
  "has neither share nor clipboard": { canShare: false, canCopy: false },
} as const;
const ABBREVIATION = "Аббревиатура";
const UTC_OFFSET = "Смещение UTC";

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

  // @add-meeting-share-dialog @FR1 @FR2 @FR4 @FR5 @FR6
  f.Scenario("The dialog opens with its defaults", ({ When, Then, And }) => {
    When("the user chooses {string}", whenChoosesShareMeeting);
    Then(
      "the share dialog is open with the title {string} and the line {string}",
      async (_ctx, title: string, line: string) => {
        expect(world.dialogTitle()).toBe(title);
        await waitFor(() => expect(world.referenceLine()).toBe(line));
      },
    );
    And(
      "every location is ticked, the share language is {string}, no share language is pinned, and the share zone label shows the zone abbreviation and the UTC offset",
      (_ctx, language: string) => {
        expect(world.rows().every((row) => row.isTicked)).toBe(true);
        expect(world.shareLanguageName()).toBe(language);
        expect(world.pin().getAttribute("aria-pressed")).toBe("false");
        expect([ABBREVIATION, UTC_OFFSET].map(world.zoneLabelPartIsOn)).toEqual(
          [true, true],
        );
      },
    );
  });

  // @add-meeting-share-dialog @FR1
  f.Scenario(
    "The reference line without a home location",
    ({ Given, When, Then, And }) => {
      Given("the list is Moscow, Kolkata and New York", () => {
        world.setOptions({ cities: ["Moscow", "Kolkata", "New York"] });
      });
      When("the user chooses {string}", whenChoosesShareMeeting);
      Then(
        "the line under the title is {string}",
        async (_ctx, line: string) => {
          await waitFor(() => expect(world.referenceLine()).toBe(line));
        },
      );
      And(
        "it stays in Russian when the user chooses {string} as the share language",
        async (_ctx, language: string) => {
          await choose(language);
          expect(world.referenceLine()).toContain("по времени Алматы");
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR2 @FR3
  f.Scenario("Rows of the sample meeting", ({ When, Then }) => {
    When("the user chooses {string}", whenChoosesShareMeeting);
    Then(
      "its rows are, in order:",
      async (
        _ctx,
        table: {
          city: string;
          "zone parts": string;
          span: string;
          date: string;
        }[],
      ) => {
        await waitFor(() =>
          expect(
            world.rows().map(({ city, zoneParts, span, date }) => ({
              city,
              "zone parts": zoneParts,
              span,
              date,
            })),
          ).toEqual(table),
        );
      },
    );
  });

  // @add-meeting-share-dialog @FR2 @FR3
  f.Scenario(
    "Unticked locations are not remembered",
    ({ Given, When, Then }) => {
      Given(
        "the user unticked {string} and {string} and closed the share dialog",
        async (_ctx, first: string, second: string) => {
          await openTheDialog();
          await world.toggleRow(first);
          await world.toggleRow(second);
          await closeDialog();
        },
      );
      When("the user chooses {string}", async () => world.openDialog());
      Then("every location is ticked", () => {
        expect(world.rows().every((row) => row.isTicked)).toBe(true);
      });
    },
  );

  // @add-meeting-share-dialog @FR9 @UX5
  f.ScenarioOutline(
    "Outcomes of a share from the dialog",
    ({ Given, When, Then }, variables) => {
      Given(
        "the share dialog is open with {string} unticked",
        async (_ctx, city: string) => {
          world.useSharing(
            BEHAVIOURS[variables.behaves as keyof typeof BEHAVIOURS],
          );
          await openTheDialog();
          await world.toggleRow(city);
        },
      );
      When(
        'the user chooses "Поделиться" and the browser <behaves>',
        async () => {
          await world.chooseShare();
        },
      );
      Then(
        "the dialog is <dialog>, the notice is <notice> and no confirmation dialog is open",
        async () => {
          const isOpenAfter = variables.dialog.startsWith("open");
          await waitFor(() => expect(world.isDialogOpen()).toBe(isOpenAfter));
          expect(screen.queryAllByRole("alertdialog")).toHaveLength(0);
          if (isOpenAfter) expect(world.rows()[2].isTicked).toBe(false);
          const notice = variables.notice;
          if (notice === "none") {
            expect(
              screen.queryByText(i18n.t("meeting.copiedNotice")),
            ).toBeNull();
          } else {
            expect(await screen.findByText(notice)).toBeInTheDocument();
          }
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR10
  f.Scenario(
    "A location is removed in another tab",
    ({ Given, When, Then }) => {
      Given(
        "the share dialog is open with {string} unticked",
        async (_ctx, city: string) => {
          await openTheDialog();
          await world.toggleRow(city);
        },
      );
      When(
        "{string} is removed from the list in another tab",
        async (_ctx, city: string) => {
          expect(city).toBe("Калькутта");
          await world.changeListInAnotherTab(["Almaty", "Moscow", "New York"]);
        },
      );
      Then(
        "the dialog shows Алматы, Москва and Нью-Йорк, {string} is still unticked and the preview has no Kolkata line",
        async (_ctx, city: string) => {
          await world.waitForRows(["Алматы", "Москва", "Нью-Йорк"]);
          expect(world.rows().find((row) => row.city === city)?.isTicked).toBe(
            false,
          );
          expect(world.previewLines().join("\n")).not.toContain("Калькутта");
          expect(world.previewLines().join("\n")).not.toContain("Kolkata");
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR10
  f.Scenario(
    "The meeting range is removed in another tab",
    ({ Given, When, Then }) => {
      Given("the share dialog is open", dialogIsOpen);
      When(
        "another tab makes {string} the home location",
        async (_ctx, city: string) => {
          await world.changeListInAnotherTab(SAMPLE_CITIES, city);
        },
      );
      Then(
        "the share dialog is closed and no meeting range is set",
        async () => {
          await waitFor(() => expect(world.isDialogOpen()).toBe(false));
          expect(
            screen.queryByRole("button", { name: SHARE_MEETING }),
          ).toBeNull();
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR12
  f.Scenario("English interface", ({ Given, When, Then }) => {
    Given("the interface language is English", () => {
      world.setOptions({ language: "en" });
    });
    When("the share dialog is open", async () => {
      await ensureOpen();
      await world.openDialog("Share meeting");
    });
    Then(
      "its captions are {string}, {string}, {string} and {string}, and its button is {string}",
      (
        _ctx: unknown,
        recipients: string,
        language: string,
        zoneLabel: string,
        preview: string,
        button: string,
      ) => {
        for (const caption of [recipients, language, zoneLabel, preview]) {
          expect(screen.getAllByText(caption).length).toBeGreaterThan(0);
        }
        expect(world.shareButtonLabel()).toBe(button);
      },
    );
  });
});
