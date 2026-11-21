// Verifies NFR-P1 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import { createMeetingShareDialogWorld } from "./meetingShareDialogWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../meeting_share_dialog_budget_unit.feature",
);

const TWENTY_LOCATIONS_COUNT = 20;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingShareDialogWorld();
  const { ensureOpen, openTheDialog, choose } = world;

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

  // @add-meeting-share-dialog @NFR-P1
  f.Scenario("A tick builds no formatter", ({ Given, When, Then }) => {
    let workCount: WorkCount | undefined;
    Given("the share dialog is open with 20 locations", async () => {
      world.setOptions({ cities: world.manyCities(TWENTY_LOCATIONS_COUNT) });
      await ensureOpen();
      await world.openDialog();
      await world.toggleRow(world.rows()[0].city);
      await world.toggleRow(world.rows()[0].city);
    });
    When("the user unticks one location and ticks it again", async () => {
      const city = world.rows()[1].city;
      workCount = startWorkCount();
      await world.toggleRow(city);
      await world.toggleRow(city);
      workCount.stop();
    });
    Then("no Intl formatter was built by these two changes", () => {
      expect((workCount as WorkCount).formatters()).toBe(0);
    });
  });

  // @add-meeting-share-dialog @NFR-P1
  f.Scenario(
    "Returning to a used language builds no formatter",
    ({ Given, When, Then }) => {
      let workCount: WorkCount | undefined;
      Given(
        "the user chose {string} and then {string} as the share language",
        async (_ctx, first: string, second: string) => {
          await openTheDialog();
          await choose(first);
          await choose(second);
        },
      );
      When(
        "the user chooses {string} again",
        async (_ctx, language: string) => {
          workCount = startWorkCount();
          await world.chooseShareLanguage(language);
          workCount.stop();
        },
      );
      Then("no Intl formatter was built by this change", () => {
        expect((workCount as WorkCount).formatters()).toBe(0);
      });
    },
  );
});
