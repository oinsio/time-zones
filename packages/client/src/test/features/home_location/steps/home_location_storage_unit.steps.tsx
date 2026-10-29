import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, renderHook, screen } from "@testing-library/react/pure";
import type { ReactNode } from "react";
import { expect, vi } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { createHomeLocationWorld } from "./homeLocationWorld";

const feature = await loadFeature("../home_location_storage_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const {
    givenList,
    givenOpen,
    whenMakesHome,
    thenIsHome,
    thenNoHome,
    thenList,
    spyOnWrites,
  } = home.steps;
  let firstTab: { result: { current: ReturnType<typeof useLocations> } };

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterAllScenarios(world.finish);

  // @set-home-location-and-show-differences @FR8
  f.Scenario("Home survives a reload", ({ Given, And, When, Then }) => {
    Given(
      "the browser storage holds the list {string}",
      (_ctx, cities: string) => home.seedList(cities),
    );
    And("the app is open", givenOpen);
    And("the user makes {string} home", whenMakesHome);
    When("the app is opened again", home.reopenApp);
    Then("{string} is the home location", thenIsHome);
  });

  // @set-home-location-and-show-differences @FR8
  f.Scenario(
    "A list from the previous version",
    ({ Given, When, Then, And }) => {
      Given(
        "the browser storage holds a version 1 list {string}",
        (_ctx, cities: string) => {
          home.seedVersion1List(cities);
          spyOnWrites();
        },
      );
      When("the user opens the app", givenOpen);
      Then("the list is {string}", thenList);
      And("no location is home", thenNoHome);
      And("nothing is written", () =>
        expect(localStorage.setItem).not.toHaveBeenCalled(),
      );
    },
  );

  // @set-home-location-and-show-differences @FR9
  f.Scenario(
    "Home points to a missing location",
    ({ Given, When, Then, And }) => {
      Given(
        "the browser storage holds the list {string} with home pointing to {string}",
        (_ctx, cities: string, homeCity: string) => {
          home.seedList(cities, homeCity);
          spyOnWrites();
        },
      );
      When("the user opens the app", givenOpen);
      Then("the list is {string}", thenList);
      And("no location is home", thenNoHome);
      And("no error is shown and nothing is written", () => {
        expect(screen.queryByRole("alert")).toBeNull();
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    },
  );

  // @set-home-location-and-show-differences @FR10
  f.Scenario("Home set in another tab", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("the app is open", givenOpen);
    And("the app is open in a first tab too", () => {
      firstTab = renderHook(() => useLocations(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <LocationsProvider
            repository={createInMemoryLocationRepository({
              backend: world.getBackend(),
            })}
            writeScheduler={immediateWriteScheduler}
          >
            {children}
          </LocationsProvider>
        ),
      });
    });
    When(
      "the user makes {string} home in the first tab",
      (_ctx, city: string) => {
        act(() => {
          firstTab.result.current.setHomeLocation(home.idOf(city));
        });
      },
    );
    Then("{string} shows the home mark", thenIsHome);
  });
});
