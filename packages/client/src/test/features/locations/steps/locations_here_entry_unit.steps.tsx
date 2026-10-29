// Verifies FR1, FR2, FR3 of show-here-entry-for-device-time.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  createHereEntryChecks,
  OFFSET_DIFFERENCE_SELECTOR,
} from "./hereEntryChecks";
import { createHereEntryWorld, DataMode } from "./hereEntryWorld";

const DIFFERENCE_ENTRY_PATTERN = /^(.+?) ([+−].+)$/u;

const feature = await loadFeature("../locations_here_entry_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createHereEntryWorld();
  const checks = createHereEntryChecks(world);
  const {
    givenDeviceZone,
    givenInstant,
    givenList,
    givenEmptyList,
    givenHome,
    givenLanguage,
    openApp,
  } = world;
  const {
    expectFirstRowIsHereEntry,
    expectLocationsInOrder,
    expectNoHereEntry,
    expectCardMark,
    expectHereEntryShows,
    expectMetaLine,
    expectNoOffsetDifference,
    expectCardDifference,
  } = checks;
  const loadedData = world.givenData(DataMode.LOADED);

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  // @show-here-entry-for-device-time @FR1
  f.Scenario("No location matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the first row is the Here entry for {string}",
      expectFirstRowIsHereEntry,
    );
    And("the locations follow in list order {string}", expectLocationsInOrder);
  });

  // @show-here-entry-for-device-time @FR1
  f.Scenario("A location matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then("no Here entry is shown", expectNoHereEntry);
    And("the {string} row shows the Here mark", (_ctx: unknown, city: string) =>
      expectCardMark(_ctx, city, "here"),
    );
  });

  // @show-here-entry-for-device-time @FR1
  f.Scenario("The home location matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list is {string}", givenList);
    And("{string} is the home location", givenHome);
    When("the user opens the app", openApp);
    Then("no Here entry is shown", expectNoHereEntry);
    And("the {string} row shows the Home mark", (_ctx: unknown, city: string) =>
      expectCardMark(_ctx, city, "home"),
    );
  });

  // @show-here-entry-for-device-time @FR1
  f.Scenario(
    "Matching is by time zone ID, not by offset",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "the first row is the Here entry for {string}",
        expectFirstRowIsHereEntry,
      );
      And(
        "the locations follow in list order {string}",
        expectLocationsInOrder,
      );
    },
  );

  // @show-here-entry-for-device-time @FR2 @UX1
  f.Scenario(
    "Here entry on the design sample",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the interface language is {string}", givenLanguage);
      And("the zone cities data is loaded", loadedData);
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "the Here entry shows {string}, the caption {string}, the meta line {string}, the time {string} and the date {string}",
        async (_ctx: unknown, ...texts: string[]) => {
          for (const text of texts) await expectHereEntryShows(text);
        },
      );
      And("its handle stands at the same position as on every card", () => {
        const hereValue = within(world.hereEntry())
          .getByRole("slider")
          .getAttribute("aria-valuenow");
        const cardValue = within(world.cardOf("Moscow"))
          .getByRole("slider")
          .getAttribute("aria-valuenow");
        expect(hereValue).toBe(cardValue);
      });
    },
  );

  // @show-here-entry-for-device-time @FR2
  f.Scenario("English meta line", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the interface language is {string}", givenLanguage);
    And("the list is empty", givenEmptyList);
    When("the user opens the app", openApp);
    Then("the Here entry's meta line is {string}", expectMetaLine);
  });

  // @show-here-entry-for-device-time @FR3
  f.Scenario("No home", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("no home location is set", () => undefined);
    And("the interface language is {string}", givenLanguage);
    And("the current instant is {string}", givenInstant);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then("the Here entry shows no offset difference", expectNoOffsetDifference);
    And(
      "the rows show the offset differences {string}",
      (_ctx: unknown, differences: string) => {
        for (const entry of differences.split(", ")) {
          const [, city, label] = entry.match(DIFFERENCE_ENTRY_PATTERN) ?? [];
          expectCardDifference(_ctx, city, label);
        }
      },
    );
  });

  // @show-here-entry-for-device-time @FR3
  f.Scenario("Travelling with home set", ({ Given, And, When, Then }) => {
    Given("{string} is the home location", givenHome);
    And("the device time zone is {string}", givenDeviceZone);
    And("the interface language is {string}", givenLanguage);
    And("the zone cities data is loaded", loadedData);
    And("the current instant is {string}", givenInstant);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the Here entry shows {string} with the offset difference {string} and the meta line {string}",
      async (_ctx: unknown, city: string, difference: string, meta: string) => {
        await expectHereEntryShows(city);
        expect(
          world.hereEntry().querySelector(OFFSET_DIFFERENCE_SELECTOR),
        ).toHaveTextContent(difference);
        await expectHereEntryShows(meta);
      },
    );
    And(
      "the reference day is {string} to {string}",
      (_ctx: unknown, start: string, end: string) => {
        const { referenceDay } = world.getLocations().rowsContext;
        expect([
          referenceDay.start.toString(),
          referenceDay.end.toString(),
        ]).toEqual([start, end]);
      },
    );
  });
});
