import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { ONE_DAY } from "@/constants";
import { TrackMove } from "@/controller";
import {
  createStore,
  getEffectiveInstant,
  getInstantAfterTrackMove,
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  LocationErrorCode,
  ReferenceMode,
  reduceLocations,
} from "@/model";
import { createDateSelectionWorld } from "./dateSelectionWorld";
import { noteOfBar, statusOfNextDayFrom } from "./wallClockStepHelpers";

const feature = await loadFeature("../date_selection_wall_clock.feature");

const NO_NOTE = "no note";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();
  let store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  let lastOutcome: ReturnType<typeof store.dispatch>;

  f.BeforeEachScenario(async () => {
    await world.reset();
    store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  });
  f.AfterAllScenarios(world.finish);

  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenAppOpen = () => world.openApp();
  const whenNextDay = () => world.showNextDay();
  const thenNoteIs = (_ctx: unknown, note: string) =>
    expect(noteOfBar(world)).toBe(note);
  const thenNoNote = () => expect(noteOfBar(world)).toBeUndefined();

  // @select-date-with-calendar-and-now @FR4
  f.Scenario("A gap is told in the bar", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the app is open", givenAppOpen);
    When("the user moves to the next day", whenNextDay);
    Then("the bar shows the note {string}", thenNoteIs);
    When("the user moves to the next day again", whenNextDay);
    Then("the bar shows no note", thenNoNote);
  });

  // @add-time-sliders-to-location-cards @FR5 @M4
  f.Scenario(
    "A time selection ends the gap note",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the app is open", givenAppOpen);
      And(
        "the user moved to the next day, so the bar shows the gap note",
        async () => {
          await whenNextDay();
          expect(noteOfBar(world)).toBeDefined();
        },
      );
      When("the user moves a day track to the next 15-minute step", () =>
        world.moveTrackToNextStep(),
      );
      Then(
        "the moment is pinned to {string} with the status {string}",
        (_ctx, pinned: string, status: string) => {
          world.expectPinnedTo(pinned);
          const replayStore = createStore(
            reduceLocations,
            INITIAL_WORLD_CLOCK_STATE,
          );
          const now = world.clock().instant();
          replayStore.dispatch({
            type: LocationCommandType.SET_DEVICE_TIME_ZONE,
            timeZoneId: world.clock().timeZoneId(),
          });
          replayStore.dispatch({
            type: LocationCommandType.SHIFT_DATE,
            days: ONE_DAY,
            now: now.toString(),
          });
          const gapState = replayStore.getSnapshot();
          replayStore.dispatch({
            type: LocationCommandType.SELECT_INSTANT,
            instant: getInstantAfterTrackMove(
              getReferenceDay(gapState, now),
              getEffectiveInstant(gapState, now),
              TrackMove.NEXT_STEP,
            ).toString(),
          });
          const { reference } = replayStore.getSnapshot();
          expect(reference.mode).toBe(ReferenceMode.PINNED);
          if (reference.mode !== ReferenceMode.PINNED) return;
          expect(reference.instant.toString()).toBe(pinned);
          expect(reference.wallClockStatus).toBe(status);
        },
      );
      And("the bar shows no note", thenNoNote);
    },
  );

  // @select-date-with-calendar-and-now @FR4 @M3
  f.ScenarioOutline(
    "Wall-clock outcomes",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is <from>", () =>
        world.setInstant(variables.from),
      );
      And("the app is open", givenAppOpen);
      When("the user moves to the next day", whenNextDay);
      Then("the moment is pinned to <pinned> with the status <status>", () => {
        world.expectPinnedTo(variables.pinned);
        expect(statusOfNextDayFrom(world, variables.from)).toBe(
          variables.status,
        );
      });
      And("the bar note is <note>", () =>
        variables.note === NO_NOTE
          ? thenNoNote()
          : expect(noteOfBar(world)).toBe(variables.note),
      );
    },
  );

  // @select-date-with-calendar-and-now @FR10
  f.Scenario(
    "A malformed date changes nothing",
    ({ Given, When, Then, And }) => {
      Given("the moment is live in the store", () => {
        expect(store.getSnapshot().reference.mode).toBe(ReferenceMode.LIVE);
      });
      When(
        "a date change arrives with the date {string}",
        (_ctx, date: string) => {
          lastOutcome = store.dispatch({
            type: LocationCommandType.SET_DATE,
            date,
            now: "2026-03-08T07:30:00Z",
          });
        },
      );
      Then("the change is rejected as an invalid date", () =>
        expect(lastOutcome).toEqual({
          ok: false,
          error: LocationErrorCode.INVALID_DATE,
        }),
      );
      And("the moment is still live in the store", () =>
        expect(store.getSnapshot().reference.mode).toBe(ReferenceMode.LIVE),
      );
    },
  );

  // @set-home-location-and-show-differences @FR4
  f.Scenario(
    "A device time zone change drops the gap note",
    ({ Given, And, When, Then }) => {
      Given("no home is set", () => undefined);
      And("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the app is open", givenAppOpen);
      And(
        "the user moved to the next day, so the bar shows the gap note",
        async () => {
          await whenNextDay();
          expect(noteOfBar(world)).toBeDefined();
        },
      );
      When(
        "the device time zone changes to {string}",
        async (_ctx, zone: string) => {
          world.setDeviceZone(zone);
          await world.runTick();
        },
      );
      Then("the moment is pinned to {string}", (_ctx, pinned: string) =>
        world.expectPinnedTo(pinned),
      );
      And("the bar shows no note", thenNoNote);
    },
  );

  const thenPinnedAsGap = (_ctx: unknown, pinned: string, status: string) => {
    world.expectPinnedTo(pinned);
    // A wall-time hint is shown exactly for GAP and AMBIGUOUS moments.
    expect(world.wallTimeHints().length > 0).toBe(status !== "UNIQUE");
  };

  // @add-wall-time-input-with-hint @FR7
  f.Scenario(
    "A wall-time input ends the gap note",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", (_ctx, cities: string) =>
        world.setStoredCities(cities),
      );
      And("the app is open", givenAppOpen);
      And(
        "the user moved to the next day, so the bar shows the gap note",
        async () => {
          await whenNextDay();
          expect(noteOfBar(world)).toBeDefined();
        },
      );
      When(
        "the user types {string} in {string}",
        (_ctx, text: string, city: string) => world.typeWallTime(city, text),
      );
      Then(
        "the moment is pinned to {string} with the status {string}",
        thenPinnedAsGap,
      );
      And("the bar shows no note", thenNoNote);
    },
  );

  // @add-wall-time-input-with-hint @FR7
  f.Scenario(
    "A gap from a wall-time input stays out of the bar",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", (_ctx, cities: string) =>
        world.setStoredCities(cities),
      );
      And("the app is open", givenAppOpen);
      When(
        "the user types {string} in {string}",
        (_ctx, text: string, city: string) => world.typeWallTime(city, text),
      );
      Then(
        "the moment is pinned to {string} with the status {string}",
        thenPinnedAsGap,
      );
      And("the bar shows no note", thenNoNote);
    },
  );
});
