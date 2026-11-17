// Verifies FR9 of apply-data-updates-silently: the watched zones are those of the list and the device.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { getWatchedZoneIds, type WorldClockState } from "@/model";
import { stateOf } from "./zoneRulesWatchedWorld";

const feature = await loadFeature("../zone_rules_updates_watched_read.feature");

const CAIRO = "Africa/Cairo";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let state: WorldClockState;
  let watchedZoneIds: string[] = [];

  // @apply-data-updates-silently @FR9
  f.Scenario("Zones of the list and of the device", ({ Given, When, Then }) => {
    Given(
      "the list holds Lisbon and Porto, both in {string}, and Cairo, and the device time zone is {string}",
      (_ctx, lisbonZone: string, deviceZone: string) => {
        state = stateOf([lisbonZone, lisbonZone, CAIRO], deviceZone);
      },
    );
    When("the watched zones are read", () => {
      watchedZoneIds = getWatchedZoneIds(state);
    });
    Then(
      "they are {string}, {string} and {string}",
      (_ctx, first: string, second: string, third: string) => {
        expect(watchedZoneIds).toEqual([first, second, third]);
      },
    );
  });

  // @apply-data-updates-silently @FR9
  f.Scenario("An empty list", ({ Given, When, Then }) => {
    Given(
      "the list is empty and the device time zone is {string}",
      (_ctx, deviceZone: string) => {
        state = stateOf([], deviceZone);
      },
    );
    When("the watched zones are read", () => {
      watchedZoneIds = getWatchedZoneIds(state);
    });
    Then("they are {string} alone", (_ctx, zoneId: string) => {
      expect(watchedZoneIds).toEqual([zoneId]);
    });
  });
});
