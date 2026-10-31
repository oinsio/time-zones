import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { TrackMove } from "@/controller";
import { INITIAL_WORLD_CLOCK_STATE, type WorldClockState } from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  restoreZoneData,
  startOnOutdatedZoneData,
} from "../../browser_compatibility/steps/legacyZoneWorld";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import type { WallTimeStepHandlers } from "./wallTimeStepHandlers";
import type { createWallTimeWorld } from "./wallTimeWorld";

type WallTimeWorld = ReturnType<typeof createWallTimeWorld>;

/**
 * The scenarios about the wall-time hint and the renamed zone of
 * `time_selection_wall_time_input_unit.feature`.
 * Implements FR7, FR9, FR11, FR13 of add-wall-time-input-with-hint.
 */
export function registerHintScenarios(
  f: FeatureDescriibeCallbackParams,
  world: WallTimeWorld,
  handlers: WallTimeStepHandlers,
) {
  const {
    givenZone,
    givenInstant,
    givenList,
    givenLanguage,
    givenAppOpen,
    whenTypes,
    thenPinned,
    thenNoHint,
    thenNoNote,
    thenStillPinned,
    givenTypedHint,
  } = handlers;
  const thenHint = (_ctx: unknown, city: string, text: string) =>
    expect(world.hintOfCity(city)).toBe(text);
  // @add-wall-time-input-with-hint @FR7
  f.Scenario("Hint for a DST gap", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the interface language is {string}", givenLanguage);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user types {string} in {string}", whenTypes);
    Then("{string} shows the hint {string}", thenHint);
    And("{string} shows no hint", (_ctx, city: string) =>
      expect(world.hintOfCity(city)).toBeUndefined(),
    );
  });

  // @add-wall-time-input-with-hint @FR7
  f.Scenario("Hint for a DST overlap", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the interface language is {string}", givenLanguage);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user types {string} in {string}", whenTypes);
    Then("{string} shows the hint {string}", thenHint);
  });

  // @add-wall-time-input-with-hint @FR7 @FR11
  f.Scenario(
    "Hint texts in Russian for a DST gap",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user types {string} in {string}", whenTypes);
      Then("{string} shows the hint {string}", thenHint);
    },
  );

  // @add-wall-time-input-with-hint @FR7 @FR11
  f.Scenario(
    "Hint texts in English for a DST overlap",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user types {string} in {string}", whenTypes);
      Then("{string} shows the hint {string}", thenHint);
    },
  );

  // @add-wall-time-input-with-hint @FR7
  f.ScenarioOutline(
    "The hint ends with the next change",
    ({ Given, And, When, Then }, variables) => {
      Given("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And(
        "the user typed {string} in {string}, so {string} shows a wall-time hint",
        (ctx, text: string, city: string) => givenTypedHint(ctx, text, city),
      );
      When("the user <change>", () => {
        const changes: Record<string, () => unknown> = {
          "types 10:00 in New York": () => world.typeTime("New York", "10:00"),
          "moves a day track to the next step": () =>
            world.moveTrack(TrackMove.NEXT_STEP),
          "moves to the next day": () => world.showNextDay(),
          "returns to now": () => world.returnToNow(),
        };
        changes[variables.change]?.();
      });
      Then("no row shows a wall-time hint", thenNoHint);
    },
  );

  // @add-wall-time-input-with-hint @FR7 @FR9
  f.Scenario("The hint leaves with its row", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    And(
      "the user typed {string} in {string}, so {string} shows a wall-time hint",
      givenTypedHint,
    );
    When("{string} is removed", (_ctx, city: string) => world.removeCity(city));
    Then("no row shows a wall-time hint", thenNoHint);
    And("the moment stays pinned", thenStillPinned);
  });

  // @add-wall-time-input-with-hint @FR7
  f.Scenario("A home change keeps the hint", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the interface language is {string}", givenLanguage);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    And(
      "the user typed {string} in {string}, so {string} shows a wall-time hint",
      givenTypedHint,
    );
    When("the user makes {string} home", (_ctx, city: string) =>
      world.makeHome(city),
    );
    Then("{string} still shows the wall-time hint", (_ctx, city: string) =>
      expect(world.hintOfCity(city)).toBeDefined(),
    );
    And(
      "the moment is pinned to {string} with the status {string}",
      thenPinned,
    );
    And("the date bar shows no note", thenNoNote);
  });

  // @add-wall-time-input-with-hint @FR7 @FR9
  // @add-settings-page-and-device-time-location @FR9
  f.Scenario(
    "A device time zone change ends the hint on the device time location",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And(
        "the user typed {string} in the device time location, so it shows a wall-time hint",
        (_ctx, text: string) => {
          world.typeInDeviceTime(text);
          expect(world.hintOfDeviceTime()).toBeDefined();
        },
      );
      When("the device time zone changes to {string}", (_ctx, zone: string) => {
        world.setDeviceZone(zone);
        world.runTick();
      });
      Then("no row shows a wall-time hint", thenNoHint);
      And("the date bar shows no note", thenNoNote);
      And(
        "the moment is pinned to {string} with the status {string}",
        thenPinned,
      );
    },
  );

  // @add-wall-time-input-with-hint @FR7
  f.Scenario(
    "A wall-time input ends the gap note",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And(
        "the user moved to the next day, so the date bar shows the gap note",
        () => {
          world.showNextDay();
          expect(world.hasDateBarNote()).toBe(true);
        },
      );
      When("the user types {string} in {string}", whenTypes);
      Then(
        "the moment is pinned to {string} with the status {string}",
        thenPinned,
      );
      And("the date bar shows no note", thenNoNote);
      And("only {string} shows a wall-time hint", (_ctx, city: string) => {
        expect(world.shownHints()).toHaveLength(1);
        expect(world.hintOfCity(city)).toBeDefined();
      });
    },
  );

  registerRenamedZoneScenario(f);
}

/** Dispatches `SET_WALL_TIME` on freshly imported modules over outdated zone data. */
function registerRenamedZoneScenario(f: FeatureDescriibeCallbackParams) {
  let engine: Awaited<ReturnType<typeof startOnOutdatedZoneData>>;
  let state: WorldClockState;
  let pinnedInstant = "";
  f.AfterEachScenario(restoreZoneData);

  // @add-wall-time-input-with-hint @FR13
  f.Scenario(
    "A renamed zone on outdated zone data",
    ({ Given, And, When, Then }) => {
      Given("the engine rejects {string} and accepts {string}", async () => {
        engine = await startOnOutdatedZoneData();
      });
      And("the device time zone is {string}", (_ctx, zone: string) => {
        state = { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: zone };
      });
      And("the current instant is {string}", () => undefined);
      And("the list contains Kyiv", () => {
        state = {
          ...state,
          locations: [buildLocation(cityEntry("Kyiv"))],
        };
      });
      When("the user types {string} in Kyiv", (_ctx, text: string) => {
        const { model } = engine.modules;
        const [kyiv] = state.locations;
        const outcome = model.reduceLocations(state, {
          type: model.LocationCommandType.SET_WALL_TIME,
          target: {
            kind: model.WallTimeTargetKind.LOCATION,
            locationId: kyiv?.id ?? "",
          },
          time: text,
          date: "2026-03-08",
        });
        if (!outcome.ok) throw new Error(outcome.error);
        state = outcome.state;
        const { reference } = outcome.state;
        pinnedInstant =
          reference.mode === model.ReferenceMode.PINNED
            ? `${reference.instant}|${reference.wallClockStatus}`
            : "";
      });
      Then(
        "the moment is pinned to {string} with the status {string}",
        (_ctx, timestamp: string, status: string) =>
          expect(pinnedInstant).toBe(`${timestamp}|${status}`),
      );
      And("the stored zone of Kyiv is still {string}", (_ctx, zone: string) =>
        expect(state.locations[0]?.timeZoneId).toBe(zone),
      );
    },
  );
}
