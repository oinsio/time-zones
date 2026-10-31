// Verifies FR10 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act } from "@testing-library/react/pure";
import { vi } from "vitest";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { createHomeLocationWorld } from "./homeLocationWorld";

const feature = await loadFeature("../home_location_device_time_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const {
    givenZone,
    givenInstant,
    givenList,
    givenHome,
    givenOpen,
    thenIsHome,
    thenTrackDay,
  } = home.steps;
  /** The device time location's city, which names its row and menu. */
  const deviceTimeCity = () => {
    const row = world
      .getLocations()
      .rows.find((candidate) => candidate.id === DEVICE_TIME_LOCATION_ID);
    if (row === undefined) throw new Error("there is no device time location");
    return row.cityLabel;
  };
  const makeDeviceTimeHome = () => home.makeHome(deviceTimeCity());
  const expectDeviceTimeIsHome = (_ctx?: unknown) =>
    thenIsHome(_ctx, deviceTimeCity());

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterAllScenarios(world.finish);

  // @add-settings-page-and-device-time-location @FR10
  f.Scenario(
    "Make the device time location home",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenOpen);
      When("the user makes the device time location home", makeDeviceTimeHome);
      Then(
        "the device time location is the home location",
        expectDeviceTimeIsHome,
      );
      And(
        "{string} shows the offset difference {string}",
        (_ctx, city: string, difference: string) =>
          world.expectRowOffset(city, difference),
      );
    },
  );

  // @add-settings-page-and-device-time-location @FR10
  f.Scenario("Home follows the device", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When(
      "the device time zone becomes {string} and the minute tick reads it",
      (_ctx, zone: string) => {
        world.setDeviceZone(zone);
        world.runTick();
      },
    );
    Then(
      "every card shows a track for the day from {string} to {string}",
      thenTrackDay,
    );
    And(
      "{string} shows the offset difference {string}",
      (_ctx, city: string, difference: string) =>
        world.expectRowOffset(city, difference),
    );
    And(
      "the device time location is the home location",
      expectDeviceTimeIsHome,
    );
  });

  // @add-settings-page-and-device-time-location @FR10
  f.Scenario("Home survives a reload", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the browser storage holds the list {string}", (_ctx, cities: string) =>
      home.seedList(cities),
    );
    And("the app is open", givenOpen);
    And("the user makes the device time location home", makeDeviceTimeHome);
    When(
      "the app is opened again on a device in {string}",
      async (_ctx, zone: string) => {
        act(() => world.setDeviceZone(zone));
        await home.reopenApp();
      },
    );
    Then(
      "the device time location is the home location",
      expectDeviceTimeIsHome,
    );
    And(
      "every card shows a track for the day from {string} to {string}",
      thenTrackDay,
    );
  });
});
