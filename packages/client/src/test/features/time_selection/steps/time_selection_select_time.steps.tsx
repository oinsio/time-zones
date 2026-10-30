import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { MAX_TRACK_FRACTION } from "@/constants";
import {
  createStore,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  LocationErrorCode,
  ReferenceMode,
  reduceLocations,
} from "@/model";
import { createSelectTimeSteps } from "./selectTimeSteps";
import type { CardTable } from "./selectTimeTables";
import { createTimeSelectionWorld } from "./timeSelectionWorld";

const feature = await loadFeature("../time_selection_select_time.feature");

const MIDDLE = 0.5;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  let store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  let lastOutcome: ReturnType<typeof store.dispatch>;

  f.BeforeEachScenario(async () => {
    await world.reset();
    store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  });
  f.AfterAllScenarios(world.finish);

  const {
    givenZone,
    givenInstant,
    givenList,
    givenAppOpen,
    givenPinnedHere,
    selectQuarter,
    whenKey,
    thenPinned,
    thenCardShows,
    thenEveryHandleAt,
  } = createSelectTimeSteps(world);

  // @add-time-sliders-to-location-cards @FR3 @M2
  f.Scenario(
    "Dragging one track moves every card",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user selects three quarters of a track", selectQuarter);
      Then("the moment is pinned to {string}", thenPinned);
      And("the cards show:", (_ctx, table: CardTable) => {
        for (const { city, time, date, offset } of table) {
          const row = world.rowOf(city);
          expect([row.localTimeLabel, row.localDateLabel]).toEqual([
            time,
            date,
          ]);
          expect(row.utcOffsetLabel).toBe(offset);
        }
      });
      And("every handle stands at {number}", thenEveryHandleAt);
    },
  );

  // @add-time-sliders-to-location-cards @FR3 @M2
  // @fix-day-track-handle-overlap-and-end-of-day @FR1
  f.ScenarioOutline(
    "Selections snap to quarter hours and stay inside the day",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user selects the fraction <fraction> of a track", () =>
        world.selectFraction(Number(variables.fraction)),
      );
      Then("the moment is pinned to <pinned>", () =>
        thenPinned(undefined, variables.pinned),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR3 @M4
  f.Scenario("Selection on a 23-hour day", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user selects the middle of a track", () =>
      world.selectFraction(MIDDLE),
    );
    Then("the moment is pinned to {string}", thenPinned);
    And("the {string} card shows {string}", thenCardShows);
  });

  // @add-time-sliders-to-location-cards @FR8
  f.Scenario(
    "A malformed instant changes nothing",
    ({ Given, When, Then, And }) => {
      Given("the moment is live in the store", () =>
        expect(store.getSnapshot().reference.mode).toBe(ReferenceMode.LIVE),
      );
      When(
        "a time selection arrives with the instant {string}",
        (_ctx, instant: string) => {
          lastOutcome = store.dispatch({
            type: LocationCommandType.SELECT_INSTANT,
            instant,
          });
        },
      );
      Then("the selection is rejected as an invalid instant", () =>
        expect(lastOutcome).toEqual({
          ok: false,
          error: LocationErrorCode.INVALID_INSTANT,
        }),
      );
      And("the moment is still live in the store", () =>
        expect(store.getSnapshot().reference.mode).toBe(ReferenceMode.LIVE),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR4 @M3
  // @fix-day-track-handle-overlap-and-end-of-day @FR2
  f.ScenarioOutline(
    "Keys from a pinned quarter hour",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the user moves the handle with <key>", () =>
        whenKey(undefined, variables.key),
      );
      Then("the moment is pinned to <pinned>", () =>
        thenPinned(undefined, variables.pinned),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR4 @M3
  f.Scenario(
    "Keys from a live moment between steps",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user moves the handle to the next step", () =>
        whenKey(undefined, "next step"),
      );
      Then("the moment is pinned to {string}", thenPinned);
      When("the user returns to now", () => world.returnToNow());
      And("the user moves the handle to the previous step", () =>
        whenKey(undefined, "previous step"),
      );
      Then("the moment is now pinned to {string}", thenPinned);
    },
  );

  // @add-time-sliders-to-location-cards @FR4
  // @fix-day-track-handle-overlap-and-end-of-day @FR2
  f.Scenario(
    "Keys stop at the ends of the day",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the user moves the handle to the next step", () =>
        whenKey(undefined, "next step"),
      );
      Then("the moment is pinned to {string}", thenPinned);
    },
  );

  // @fix-day-track-handle-overlap-and-end-of-day @FR1 @UX2
  f.ScenarioOutline(
    "The right end reaches the last minute of 23- and 25-hour days",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is <instant>", () =>
        givenInstant(undefined, variables.instant),
      );
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user selects the fraction 1.0 of the track", () =>
        world.selectFraction(MAX_TRACK_FRACTION),
      );
      Then("the {string} card shows {string}", thenCardShows);
    },
  );

  // @fix-day-track-handle-overlap-and-end-of-day @FR2
  f.ScenarioOutline(
    "Keys around the track end",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is <from>", () =>
        givenInstant(undefined, variables.from),
      );
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the user moves the handle with <key>", () =>
        whenKey(undefined, variables.key),
      );
      Then("the moment is pinned to <pinned>", () =>
        thenPinned(undefined, variables.pinned),
      );
    },
  );
});
