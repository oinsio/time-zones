import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act } from "@testing-library/react/pure";
import { expect } from "vitest";
import en from "@/locales/en.json";
import { setPageVisibility } from "@/test/pageVisibility";
import { createLocalTimeWorld } from "./localTimeWorld";

const feature = await loadFeature("../locations_clock_tick.feature");

const BADGE_TEXT = en.locations.deviceTimeZoneBadge;
const MINUTE_UPDATES_COUNT = 3;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createLocalTimeWorld();

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const givenDeviceZone = (_ctx: unknown, zone: string) =>
    world.setDeviceZone(zone);
  const whenOpens = () => world.openApp();
  const whenNextMinuteStarts = (_ctx: unknown, timestamp: string) => {
    world.setInstant(timestamp);
    world.runTick();
  };
  const whenPageHidden = () => act(() => setPageVisibility("hidden"));
  const whenPageVisible = () => act(() => setPageVisibility("visible"));
  const whenDeviceZoneBecomes = (_ctx: unknown, zone: string) =>
    world.setDeviceZone(zone);
  const thenShowsTime = (_ctx: unknown, city: string, time: string) =>
    expect(world.timeOf(city)).toBe(time);
  const thenShowsOffset = (_ctx: unknown, city: string, offset: string) =>
    expect(world.rowOf(city)).toHaveTextContent(offset);
  const thenShowsTimeAndOffset = (
    _ctx: unknown,
    city: string,
    time: string,
    offset: string,
  ) => {
    thenShowsTime(_ctx, city, time);
    thenShowsOffset(_ctx, city, offset);
  };
  const thenNextUpdateDueIn = (_ctx: unknown, delayMs: number) =>
    expect(world.getTickScheduler().lastDelayMs()).toBe(delayMs);
  const thenShowsBadge = (_ctx: unknown, city: string) =>
    expect(world.rowOf(city)).toHaveTextContent(BADGE_TEXT);
  const thenShowsNoBadge = (_ctx: unknown, city: string) =>
    expect(world.rowOf(city)).not.toHaveTextContent(BADGE_TEXT);

  // @show-local-time-and-date-on-location-cards @FR3 @M3
  f.Scenario(
    "The time changes at the minute boundary",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      Then("the {string} row shows the time {string}", thenShowsTime);
      And("the next update is due in {int} ms", thenNextUpdateDueIn);
      When("the next minute starts at {string}", whenNextMinuteStarts);
      Then("the {string} row now shows the time {string}", thenShowsTime);
      And("the next update is then due in {int} ms", thenNextUpdateDueIn);
    },
  );

  // @show-local-time-and-date-on-location-cards @FR3 @M3
  f.Scenario(
    "No updates while the page is hidden",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      And("the page becomes hidden", whenPageHidden);
      Then("no update is due", () =>
        expect(world.getTickScheduler().hasPending()).toBe(false),
      );
      When(
        "the page becomes visible at {string}",
        (_ctx, timestamp: string) => {
          world.setInstant(timestamp);
          whenPageVisible();
        },
      );
      Then("the {string} row shows the time {string}", thenShowsTime);
      And("the next update is due in {int} ms", thenNextUpdateDueIn);
    },
  );

  // @show-local-time-and-date-on-location-cards @FR3 @FR4 @M3
  f.Scenario(
    "The offset follows a DST change while the app is open",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      Then(
        "the {string} row shows the time {string} and the offset {string}",
        thenShowsTimeAndOffset,
      );
      When("the next minute starts at {string}", whenNextMinuteStarts);
      Then(
        "the {string} row now shows the time {string} and the offset {string}",
        thenShowsTimeAndOffset,
      );
    },
  );

  // @show-local-time-and-date-on-location-cards @FR3 @FR4
  f.Scenario("Updates write nothing", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", whenOpens);
    And("three minute updates happen", () => {
      for (let update = 0; update < MINUTE_UPDATES_COUNT; update += 1) {
        world.runTick();
      }
    });
    Then("the stored list was not written", () =>
      expect(world.getWriteScheduler().lastDelayMs()).toBeUndefined(),
    );
  });

  // @show-local-time-and-date-on-location-cards @FR4
  f.Scenario(
    "Offset is computed again at the minute boundary",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      Then("the {string} row shows the offset {string}", thenShowsOffset);
      When("the next minute starts at {string}", whenNextMinuteStarts);
      Then("the {string} row now shows the offset {string}", thenShowsOffset);
    },
  );

  // @show-local-time-and-date-on-location-cards @FR4
  f.Scenario(
    "Device zone is read again at the minute boundary",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      And("the device time zone becomes {string}", whenDeviceZoneBecomes);
      And("the next minute starts at {string}", whenNextMinuteStarts);
      Then("the {string} row shows the badge", thenShowsBadge);
      And("the {string} row shows no badge", thenShowsNoBadge);
    },
  );

  // @show-local-time-and-date-on-location-cards @FR4
  f.Scenario(
    "Device zone is read again when the page becomes visible",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      And("the page becomes hidden", whenPageHidden);
      And("the device time zone becomes {string}", whenDeviceZoneBecomes);
      And("the page becomes visible", whenPageVisible);
      Then("the {string} row shows the badge", thenShowsBadge);
      And("the {string} row shows no badge", thenShowsNoBadge);
    },
  );
});
