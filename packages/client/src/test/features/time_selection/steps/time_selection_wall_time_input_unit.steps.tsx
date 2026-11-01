import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect } from "vitest";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { WallTimeInputOutcome } from "@/controller";
import { DEFAULT_LANGUAGE } from "@/locales";
import {
  createStore,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
  WallTimeTargetKind,
} from "@/model";
import { getDayPeriodMarkers, parseWallTimeInput } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { registerHintScenarios } from "./wallTimeHintScenarios";
import { createWallTimeStepHandlers } from "./wallTimeStepHandlers";
import { createWallTimeWorld } from "./wallTimeWorld";

const feature = await loadFeature(
  "../time_selection_wall_time_input_unit.feature",
);

const MANY_INPUTS = 20;
const QUOTE_LENGTH = 1;
const unquote = (text: string) => text.slice(QUOTE_LENGTH, -QUOTE_LENGTH);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createWallTimeWorld();
  let parsedTime: string | undefined;
  let otherTabNotifications = 0;
  let documentBefore: unknown;
  let store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  let lastStoreOutcome: ReturnType<typeof store.dispatch>;

  f.BeforeEachScenario(async () => {
    await world.reset();
    otherTabNotifications = 0;
    store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  });
  f.AfterAllScenarios(world.finish);

  const handlers = createWallTimeStepHandlers(world);
  const {
    givenZone,
    givenInstant,
    givenList,
    givenLanguage,
    givenAppOpen,
    whenTypes,
    thenPinned,
    thenCardShows,
    thenStillLive,
    thenStillPinned,
  } = handlers;

  // @add-wall-time-input-with-hint @FR1
  f.Scenario("No input for an unknown zone", ({ Given, When, Then, And }) => {
    Given(
      "the list holds {string} and a location in the unknown zone {string}",
      (_ctx, city: string, zone: string) => {
        world.setStoredLocations([
          buildLocation(cityEntry(city)),
          buildLocation({ label: "Olympus", timeZoneId: zone }),
        ]);
      },
    );
    When("the list is presented", givenAppOpen);
    Then("{string} has a wall-time input", (_ctx, city: string) =>
      expect(world.hasWallTimeInput(city)).toBe(true),
    );
    And("the other location has none", () =>
      expect(world.hasWallTimeInput("Olympus")).toBe(false),
    );
  });

  // @add-wall-time-input-with-hint @FR2 @M4
  f.ScenarioOutline("Accepted texts", ({ When, Then }, variables) => {
    When("the user confirms the text <text>", () => {
      parsedTime = parseWallTimeInput(
        unquote(variables.text),
        getDayPeriodMarkers(DEFAULT_LANGUAGE),
      );
    });
    Then("the typed wall-clock time is <time>", () =>
      expect(parsedTime).toBe(variables.time),
    );
  });

  // @add-wall-time-input-with-hint @FR6 @M4
  f.ScenarioOutline(
    "Rejected texts",
    ({ Given, And, When, Then }, variables) => {
      Given("the interface language is {string}", givenLanguage);
      And("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user confirms the text <text> in New York", () =>
        world.typeTime("New York", unquote(variables.text)),
      );
      Then("the field shows the error {string}", (_ctx, message: string) => {
        expect(world.lastOutcome()).toBe(WallTimeInputOutcome.INVALID_TEXT);
        expect(i18n.t("locations.wallTimeInputError")).toBe(message);
      });
      And("the moment is still live", thenStillLive);
    },
  );

  // @add-wall-time-input-with-hint @FR3 @M2
  f.Scenario("Type a time in another city", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user types {string} in {string}", whenTypes);
    Then(
      "the moment is pinned to {string} with the status {string}",
      thenPinned,
    );
    And("the cards show:", (ctx, table: { city: string; time: string }[]) => {
      for (const { city, time } of table) thenCardShows(ctx, city, time);
    });
  });

  // @add-wall-time-input-with-hint @FR3 @M3
  f.ScenarioOutline(
    "Wall-clock outcomes of a typed time",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is <now>", () =>
        givenInstant(undefined, variables.now),
      );
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user types <typed> in New York", () =>
        world.typeTime("New York", variables.typed),
      );
      Then("the moment is pinned to <pinned> with the status <status>", () =>
        thenPinned(undefined, variables.pinned, variables.status),
      );
    },
  );

  // @add-wall-time-input-with-hint @FR3 @M2
  // @add-settings-page-and-device-time-location @FR9
  f.Scenario(
    "Type a time in the device time location",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When(
        "the user types {string} in the device time location",
        (_ctx, text: string) => world.typeInDeviceTime(text),
      );
      Then(
        "the moment is pinned to {string} with the status {string}",
        thenPinned,
      );
      And("the {string} card shows {string}", thenCardShows);
    },
  );

  // @add-wall-time-input-with-hint @FR4 @FR8 @M2
  // @keep-now-button-visible-when-live @FR3
  f.Scenario(
    "The typed instant leaves the reference day",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user types {string} in {string}", whenTypes);
      Then(
        "the moment is pinned to {string} with the status {string}",
        thenPinned,
      );
      And("the date bar shows {string}", (_ctx, label: string) =>
        expect(world.dateBarLabel()).toBe(label),
      );
      And(
        "the reference day runs from {string} to {string}",
        (_ctx, start: string, end: string) => {
          const bounds = world.dayBoundsOf("Almaty");
          expect([bounds.start.toString(), bounds.end.toString()]).toEqual([
            start,
            end,
          ]);
        },
      );
      And("the Now button is active", thenStillPinned);
    },
  );

  // @add-wall-time-input-with-hint @FR9 @M5
  f.Scenario("Nothing is stored or shared", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    And("another tab watches the list", () => {
      documentBefore = world.backendDocument();
      world.openOtherTab().subscribe(() => {
        otherTabNotifications += 1;
      });
    });
    When(
      "the user types 20 times in {string} and then returns to now",
      (_ctx, city: string) => {
        for (let attempt = 0; attempt < MANY_INPUTS; attempt += 1) {
          world.typeTime(city, `${attempt}:15`);
        }
        world.returnToNow();
      },
    );
    Then("nothing is written to storage", () => {
      world.getWriteScheduler().runPending();
      expect(world.backendDocument()).toBe(documentBefore);
    });
    And("no other tab receives a change", () =>
      expect(otherTabNotifications).toBe(0),
    );
  });

  // @add-wall-time-input-with-hint @FR10
  f.Scenario(
    "The location is gone while typing",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And(
        "the user opened the wall-time input of {string}",
        (_ctx, city: string) => world.openField(city),
      );
      And("{string} was removed in another tab", (_ctx, city: string) =>
        world.removeCityInAnotherTab(city),
      );
      When(
        "the user confirms {string} in {string}",
        (_ctx, text: string, city: string) =>
          world.typeInOpenedField(city, text),
      );
      Then("the field closes without a message", () =>
        expect(world.lastOutcome()).toBe(WallTimeInputOutcome.CLOSED),
      );
      And("the moment is still live", thenStillLive);
    },
  );

  // @add-wall-time-input-with-hint @FR9 @FR10
  f.ScenarioOutline(
    "A malformed command changes nothing",
    ({ Given, When, Then, And }, variables) => {
      Given("the moment is live in the store", () =>
        expect(store.getSnapshot().reference.mode).toBe("LIVE"),
      );
      When(
        "a wall-time input arrives with the time <time> and the date <date>",
        () => {
          lastStoreOutcome = store.dispatch({
            type: LocationCommandType.SET_WALL_TIME,
            target: {
              kind: WallTimeTargetKind.LOCATION,
              locationId: DEVICE_TIME_LOCATION_ID,
            },
            time: variables.time,
            date: variables.date,
          });
        },
      );
      Then("it is rejected as <error>", () =>
        expect(lastStoreOutcome).toEqual({ ok: false, error: variables.error }),
      );
      And("the moment is still live in the store", () =>
        expect(store.getSnapshot().reference.mode).toBe("LIVE"),
      );
    },
  );

  registerHintScenarios(f, world, handlers);
});
