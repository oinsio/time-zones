import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { vi } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createHomeLocationWorld } from "./homeLocationWorld";

const feature = await loadFeature("../home_location_menu_unit.feature");

const UNKNOWN_ZONE_LABEL = "Olympus";
const UNKNOWN_ZONE_ID = "Nowhere/Olympus";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const { givenList, givenHome, givenOpen, whenOpensMenu, thenMenuOffers } =
    home.steps;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterAllScenarios(world.finish);

  // @set-home-location-and-show-differences @FR11
  f.Scenario("Menu of a row that is not home", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user opens the location menu of {string}", whenOpensMenu);
    Then("the menu offers {string}", thenMenuOffers);
  });

  // @set-home-location-and-show-differences @FR11
  f.Scenario("Menu of the home row", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user opens the location menu of {string}", whenOpensMenu);
    Then("the menu offers {string}", thenMenuOffers);
  });

  // @set-home-location-and-show-differences @FR11
  f.Scenario(
    "No home item for an unknown zone",
    ({ Given, And, When, Then }) => {
      Given(
        "the list holds Moscow and a location whose zone the browser does not know",
        () =>
          world.setStoredLocations([
            buildLocation(cityEntry("Moscow")),
            buildLocation({
              label: UNKNOWN_ZONE_LABEL,
              timeZoneId: UNKNOWN_ZONE_ID,
              countryCode: "",
            }),
          ]),
      );
      And("the app is open", givenOpen);
      When("the user opens the location menu of {string}", whenOpensMenu);
      Then("the menu offers {string}", thenMenuOffers);
    },
  );
});
