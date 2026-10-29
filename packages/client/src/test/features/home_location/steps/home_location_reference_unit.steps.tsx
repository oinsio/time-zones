import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { createHomeLocationWorld } from "./homeLocationWorld";

const feature = await loadFeature("../home_location_reference_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const {
    givenZone,
    givenInstant,
    givenList,
    givenHome,
    givenOpen,
    whenMakesHome,
    thenIsHome,
    thenIsNotHome,
    whenMovedToNextDay,
    thenNoNote,
    thenPinned,
    thenTrackDay,
  } = home.steps;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterAllScenarios(world.finish);

  // @set-home-location-and-show-differences @FR4
  f.Scenario(
    "The day follows home while travelling",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      When("the user opens the app", givenOpen);
      Then(
        "every card shows a track for the day from {string} to {string}",
        thenTrackDay,
      );
    },
  );

  // @set-home-location-and-show-differences @FR4
  f.Scenario(
    "Clearing home returns to the device day",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      And("the app is open", givenOpen);
      When("the user clears home", home.clearHome);
      Then(
        "every card shows a track for the day from {string} to {string}",
        thenTrackDay,
      );
      And("the moment is live", () => world.expectLive());
    },
  );

  // @set-home-location-and-show-differences @FR4
  f.Scenario(
    "A pinned moment keeps its instant",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenOpen);
      And("the user moved to the next day", whenMovedToNextDay);
      When("the user makes {string} home", whenMakesHome);
      Then("the moment is pinned to {string}", thenPinned);
      And("the date bar shows the date {string}", (_ctx, date: string) =>
        expect(world.shownIsoDate()).toBe(date),
      );
    },
  );

  // @set-home-location-and-show-differences @FR4
  f.Scenario(
    "A home change drops the gap note",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenOpen);
      And(
        "the user moved to the next day, so the bar shows the gap note",
        async () => {
          await whenMovedToNextDay();
          expect(home.noteOfBar()).toBeDefined();
        },
      );
      When("the user makes {string} home", whenMakesHome);
      Then("the moment is pinned to {string}", thenPinned);
      And("the bar shows no note", thenNoNote);
    },
  );

  // @set-home-location-and-show-differences @FR7 @UX2
  f.Scenario(
    "Only the home row shows the home mark",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      When("the user opens the app", givenOpen);
      Then("{string} shows the home mark", thenIsHome);
      And("{string} shows no home mark", thenIsNotHome);
    },
  );

  // @set-home-location-and-show-differences @FR7
  f.Scenario("Home in the device time zone", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    When("the user opens the app", givenOpen);
    Then(
      "the {string} row has exactly {int} leading mark",
      (_ctx, city: string, count: number) =>
        expect(within(world.rowOf(city)).getAllByRole("img")).toHaveLength(
          count,
        ),
    );
    And(
      "the {string} row shows no {string} caption",
      (_ctx, city: string, caption: string) =>
        expect(within(world.rowOf(city)).queryByText(caption)).toBeNull(),
    );
  });

  // @set-home-location-and-show-differences @FR7
  f.Scenario("Travelling", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    When("the user opens the app", givenOpen);
    Then("{string} shows the home mark", thenIsHome);
    And(
      "{string} shows the Here mark and the caption {string}",
      (_ctx, city: string, caption: string) => {
        const row = within(world.rowOf(city));
        expect(
          row.getByRole("img", { name: i18n.t("locations.hereMarkLabel") }),
        ).toBeInTheDocument();
        expect(row.getByText(caption)).toBeInTheDocument();
      },
    );
  });
});
