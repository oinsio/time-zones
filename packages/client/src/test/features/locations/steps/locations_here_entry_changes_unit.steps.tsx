// Verifies FR4, FR5, FR6, FR10 of show-here-entry-for-device-time.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { LocationsLoadStatus } from "@/ports";
import { createHereEntryChecks } from "./hereEntryChecks";
import { createHereEntryWorld } from "./hereEntryWorld";

const feature = await loadFeature(
  "../locations_here_entry_changes_unit.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createHereEntryWorld();
  const checks = createHereEntryChecks(world);
  const {
    givenDeviceZone,
    givenInstant,
    givenList,
    givenEmptyList,
    givenLanguage,
    openApp,
    whenAdds,
    whenRemoves,
  } = world;
  const {
    markImage,
    expectFirstRowIsHereEntry,
    expectNoHereEntry,
    expectCardMark,
    expectHereEntryShows,
    expectCardTime,
  } = checks;

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  // @show-here-entry-for-device-time @FR4
  f.Scenario("Nothing to remove or move", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the Here entry has no remove action, no drag handle and no Location menu",
      () =>
        expect(within(world.hereEntry()).queryAllByRole("button")).toEqual([]),
    );
  });

  // @show-here-entry-for-device-time @FR4
  f.Scenario(
    "Nothing is stored for the Here entry",
    ({ Given, And, When, Then }) => {
      Given("no location list is stored", world.givenNoStoredList);
      And("the device time zone is {string}", givenDeviceZone);
      When(
        "the user opens the app and selects a time on the Here entry's day track",
        async () => {
          await openApp();
          world.whenMovesHereTrackOneHourForward();
        },
      );
      Then("no location list is stored", () =>
        expect(world.getBackend().document.status).toBe(
          LocationsLoadStatus.EMPTY,
        ),
      );
    },
  );

  // @show-here-entry-for-device-time @FR5
  f.Scenario(
    "Time selection from the Here entry",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And(
        "the user moves the Here entry's day track one hour forward",
        world.whenMovesHereTrackOneHourForward,
      );
      Then(
        "the Here entry shows the time {string}",
        (_ctx: unknown, time: string) => expectHereEntryShows(time),
      );
      And("the {string} row shows the time {string}", expectCardTime);
      And("the Now button is shown", () =>
        expect(world.nowButton()).toBeInTheDocument(),
      );
    },
  );

  // @show-here-entry-for-device-time @FR6
  f.Scenario(
    "Adding the device's city hides the Here entry",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And("the user adds {string}", whenAdds);
      Then("no Here entry is shown", expectNoHereEntry);
      And(
        "exactly 1 row shows the Here mark: {string}",
        (_ctx: unknown, city: string) => {
          expect(
            screen.getAllByRole("img", { name: markImage("here") }),
          ).toHaveLength(1);
          expectCardMark(_ctx, city, "here");
        },
      );
    },
  );

  // @show-here-entry-for-device-time @FR6
  f.Scenario(
    "Removing the device's city shows the Here entry",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And("the user removes {string}", whenRemoves);
      Then(
        "the first row is the Here entry for {string}",
        expectFirstRowIsHereEntry,
      );
    },
  );

  // @show-here-entry-for-device-time @FR6
  f.Scenario(
    "The device moves to another zone",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And(
        "the device time zone becomes {string} and the minute tick reads it",
        world.whenDeviceZoneBecomesAndTicks,
      );
      Then("no Here entry is shown", expectNoHereEntry);
      And(
        "the {string} row shows the Here mark",
        (_ctx: unknown, city: string) => expectCardMark(_ctx, city, "here"),
      );
    },
  );

  // @show-here-entry-for-device-time @FR6
  f.Scenario("Unknown device time zone", ({ Given, And, When, Then }) => {
    Given("the device reports the time zone {string}", givenDeviceZone);
    And("the interface language is {string}", givenLanguage);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the Here entry shows {string}, the caption {string} and the meta line {string}",
      async (_ctx: unknown, ...texts: string[]) => {
        for (const text of texts) await expectHereEntryShows(text);
      },
    );
  });

  // @show-here-entry-for-device-time @FR10
  f.Scenario("Both languages", ({ Given, And, When, Then }) => {
    const metaLines: string[] = [];
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list is empty", givenEmptyList);
    When("the user opens the app", openApp);
    And(
      "the interface language is switched between English and Russian",
      async () => {
        for (const language of ["en", "ru"]) {
          await act(async () => {
            await i18n.changeLanguage(language);
          });
          metaLines.push(
            within(world.hereEntry()).getByText(/UTC/).textContent ?? "",
          );
        }
      },
    );
    Then(
      "the meta line reads {string} and {string}",
      (_ctx: unknown, english: string, russian: string) => {
        expect(metaLines).toEqual([english, russian]);
      },
    );
  });
});
