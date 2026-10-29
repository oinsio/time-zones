// Verifies FR3 of set-home-location-and-show-differences.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  createStore,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
} from "@/model";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";

const feature = await loadFeature("../locations_home_removal_unit.feature");

const idOf = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] }).id;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);

  // @set-home-location-and-show-differences @FR3
  f.Scenario("Remove the home location", ({ Given, When, Then, And }) => {
    Given("the list is Almaty, Moscow and Almaty is home", () => {
      store = createStore(reduceLocations, {
        ...INITIAL_WORLD_CLOCK_STATE,
        locations: ["Almaty", "Moscow"].map((label) =>
          buildLocation({ label, ...KNOWN_CITIES[label] }),
        ),
      });
      store.dispatch({
        type: LocationCommandType.SET_HOME_LOCATION,
        id: idOf("Almaty"),
      });
    });
    When("the user removes Almaty", () => {
      store.dispatch({
        type: LocationCommandType.REMOVE_LOCATION,
        id: idOf("Almaty"),
      });
    });
    Then("the list is Moscow", () => {
      expect(store.getSnapshot().locations.map(({ label }) => label)).toEqual([
        "Moscow",
      ]);
    });
    And("no location is home", () => {
      expect(store.getSnapshot().homeLocationId).toBeNull();
    });
  });
});
