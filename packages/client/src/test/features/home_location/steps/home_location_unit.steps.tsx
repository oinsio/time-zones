import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationErrorCode } from "@/model";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createHomeLocationWorld } from "./homeLocationWorld";

const feature = await loadFeature("../home_location_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const {
    givenList,
    givenHome,
    givenOpen,
    whenMakesHome,
    thenIsHome,
    thenIsNotHome,
    thenNoHome,
    thenList,
  } = home.steps;
  let lastOutcome: ReturnType<
    ReturnType<typeof home.world.getLocations>["setHomeLocation"]
  >;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterAllScenarios(world.finish);

  // @set-home-location-and-show-differences @FR1
  f.Scenario("Make Almaty home", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("the app is open", givenOpen);
    When("the user makes {string} home", whenMakesHome);
    Then("{string} is the home location", thenIsHome);
  });

  // @set-home-location-and-show-differences @FR1
  f.Scenario("Home moves to another location", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user makes {string} home", whenMakesHome);
    Then("{string} is the home location", thenIsHome);
    And("{string} is not the home location", thenIsNotHome);
  });

  // @set-home-location-and-show-differences @FR1
  f.Scenario("Location already gone", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    And("{string} was removed in another tab", (_ctx, city: string) => {
      const remaining = world
        .getLocations()
        .locations.filter((location) => location.label !== city);
      act(() => {
        createInMemoryLocationRepository({ backend: world.getBackend() }).save({
          locations: remaining,
          homeLocationId:
            remaining.find((l) => l.id === home.idOf("Almaty"))?.id ?? null,
        });
      });
    });
    When("a request to make {string} home arrives", (_ctx, city: string) => {
      act(() => {
        lastOutcome = world.getLocations().setHomeLocation(home.idOf(city));
      });
    });
    Then("it is reported as location not found", () =>
      expect(lastOutcome).toEqual({
        ok: false,
        error: LocationErrorCode.LOCATION_NOT_FOUND,
      }),
    );
    And("{string} is the home location", thenIsHome);
  });

  // @set-home-location-and-show-differences @FR2
  f.Scenario("Clear home", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user clears home", home.clearHome);
    Then("no location is home", thenNoHome);
  });

  // @set-home-location-and-show-differences @FR3
  f.Scenario("Removing home clears it", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user removes {string}", (_ctx, city: string) =>
      home.removeCity(city),
    );
    Then("no location is home", thenNoHome);
  });

  // @set-home-location-and-show-differences @FR3
  f.Scenario(
    "The first added location is not home",
    ({ Given, And, When, Then }) => {
      Given("the list is empty", () => world.setStoredLocations([]));
      And("the app is open", givenOpen);
      When("the user adds {string}", (_ctx, city: string) => {
        act(() => {
          world.getLocations().addLocation(cityEntry(city));
        });
      });
      Then("no location is home", thenNoHome);
    },
  );

  // @set-home-location-and-show-differences @FR3
  f.Scenario("Reorder keeps home in place", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When(
      "the user moves {string} to the first position",
      (_ctx, city: string) => {
        act(() => {
          world.getLocations().moveLocation(home.idOf(city), 0);
        });
      },
    );
    Then("the list is {string}", thenList);
    And("{string} is the home location", thenIsHome);
  });
});
