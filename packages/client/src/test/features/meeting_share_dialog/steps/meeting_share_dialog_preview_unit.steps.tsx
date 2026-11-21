// Verifies FR1, FR2, FR3, FR4, FR5, FR6, FR8, FR9, FR10, FR12, UX5, NFR-P1 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { waitFor } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { createMeetingShareDialogWorld } from "./meetingShareDialogWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../meeting_share_dialog_preview_unit.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingShareDialogWorld();
  const { openTheDialog, choose, closeDialog } = world;
  const dialogIsOpen = () => openTheDialog();
  const previewLineOf = (city: string) =>
    world.previewLines().find((line) => line.startsWith(city));

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

  // @add-meeting-share-dialog @FR6
  f.Scenario("Turning the UTC offset off", ({ Given, When, Then, And }) => {
    Given("the share dialog is open", dialogIsOpen);
    When("the user turns {string} off", (_ctx, name: string) =>
      world.toggleZoneLabelPart(name),
    );
    Then(
      "the preview line of Moscow is {string} and the preview line of Almaty is {string}",
      async (_ctx, moscow: string, almaty: string) => {
        await waitFor(() => expect(previewLineOf("Москва")).toBe(moscow));
        expect(previewLineOf("Алматы")).toBe(almaty);
      },
    );
    And(
      "the rows of the Grid view still show their zone lines with the UTC offset",
      () => {
        expect(world.rows()[1].zoneParts).toContain("UTC+3");
      },
    );
  });

  // @add-meeting-share-dialog @FR6
  f.Scenario("The choice is used the next time", ({ Given, When, Then }) => {
    Given(
      "the user turned {string} off and closed the dialog",
      async (_ctx, name: string) => {
        await openTheDialog();
        await world.toggleZoneLabelPart(name);
        await closeDialog();
      },
    );
    When("the user chooses {string}", async () => world.openDialog());
    Then(
      "{string} is off and {string} is on",
      (_ctx, off: string, on: string) => {
        expect(world.zoneLabelPartIsOn(off)).toBe(false);
        expect(world.zoneLabelPartIsOn(on)).toBe(true);
      },
    );
  });

  // @add-meeting-share-dialog @FR8
  f.Scenario(
    "The preview is the text that is shared",
    ({ Given, When, Then }) => {
      let previewed: string[] = [];
      Given(
        "a browser with a system share and the share dialog open",
        async () => {
          world.useSharing({ canShare: true, canCopy: true });
          await openTheDialog();
        },
      );
      When(
        "the user unticks {string}, chooses {string} as the share language and chooses {string}",
        async (_ctx, city: string, language: string) => {
          await world.toggleRow(city);
          await choose(language);
          await waitFor(() =>
            expect(world.previewLines()[0]).toMatch(/^Meeting on/),
          );
          previewed = world.previewLines();
          await world.chooseShare();
        },
      );
      Then(
        "the system share receives exactly the lines the preview showed",
        () => {
          expect(world.getSharing().sharedTexts).toEqual([
            previewed.join("\n"),
          ]);
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR8
  f.Scenario("The preview follows the ticks", ({ Given, When, Then }) => {
    Given("the share dialog is open", dialogIsOpen);
    When("the user unticks {string}", (_ctx, city: string) =>
      world.toggleRow(city),
    );
    Then(
      "the preview has the heading and the lines of Almaty, Moscow and New York, in that order",
      async () => {
        await waitFor(() =>
          expect(
            world.previewLines().map((line) => line.split(" (")[0]),
          ).toEqual([world.previewLines()[0], "Алматы", "Москва", "Нью-Йорк"]),
        );
      },
    );
  });
});
