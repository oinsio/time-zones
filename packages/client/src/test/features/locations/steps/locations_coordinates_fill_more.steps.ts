// Implements FR8, UX2, G2 of add-city-coordinates-to-locations: stored locations gain coordinates.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, waitFor } from "@testing-library/react/pure";
import { expect } from "vitest";
import { LocationsStatus } from "@/controller";
import {
  buildCityLocation,
  coordinatesOf,
  KAZAN_COORDINATES,
  openStoredList,
  parseCityNames,
  type StoredListWorld,
} from "./locationsCoordinatesWorld";

const feature = await loadFeature("../locations_coordinates_fill_more.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let world: StoredListWorld;
  let storedLocations = [buildCityLocation("Moscow")];
  let homeLabel: string | undefined;
  let hasOtherTab = false;
  let otherTab: ReturnType<StoredListWorld["openOtherTab"]> | undefined;

  f.BeforeEachScenario(() => {
    cleanup();
    homeLabel = undefined;
    hasOtherTab = false;
    otherTab = undefined;
  });
  f.AfterAllScenarios(() => cleanup());

  const open = (isLoadFailing = false) => {
    world = openStoredList({
      locations: storedLocations,
      homeLocationId:
        homeLabel === undefined ? null : buildCityLocation(homeLabel).id,
      isLoadFailing,
    });
    if (hasOtherTab) otherTab = world.openOtherTab();
  };
  const whenOpenedAndLoaded = async () => {
    open();
    await waitFor(() => expect(world.loader.getLoadCount()).toBe(1));
    await waitFor(() =>
      expect(world.loader.getLookupCount()).toBeGreaterThan(0),
    );
  };
  const expectWrites = (count: number) => () =>
    expect(world.getWriteCount()).toBe(count);

  // @add-city-coordinates-to-locations @FR8 @UX2
  f.Scenario("Order and home are kept", ({ Given, When, Then, And }) => {
    Given(
      "the stored list is Almaty, Moscow, Kazan without coordinates and Moscow is home",
      () => {
        storedLocations = parseCityNames("Almaty, Moscow, Kazan").map((label) =>
          buildCityLocation(label),
        );
        homeLabel = "Moscow";
      },
    );
    When(
      "the app is opened and the city data finishes loading",
      whenOpenedAndLoaded,
    );
    Then("the list is Almaty, Moscow, Kazan in that order", async () => {
      await waitFor(() => expect(world.getWriteCount()).toBe(1));
      expect(
        world.app.result.current.locations.map(({ label }) => label),
      ).toEqual(["Almaty", "Moscow", "Kazan"]);
    });
    And("Moscow is home", () => {
      expect(world.app.result.current.rows.find((row) => row.mark)?.id).toBe(
        buildCityLocation("Moscow").id,
      );
    });
  });

  // @add-city-coordinates-to-locations @FR8
  f.Scenario("The city data fails to load", ({ Given, When, Then, And }) => {
    Given("the stored list holds Moscow without coordinates", () => {
      storedLocations = [buildCityLocation("Moscow")];
    });
    When("the city data fails to load", async () => {
      open(true);
      await waitFor(() => expect(world.loader.getLoadCount()).toBe(1));
    });
    Then("Moscow holds no coordinates", () => {
      expect(coordinatesOf(world, "Moscow")).toBeUndefined();
    });
    And("no error is shown", () => {
      expect(world.app.result.current.loadStatus).toBe(LocationsStatus.READY);
    });
    And("the list was not written", expectWrites(0));
  });

  // @add-city-coordinates-to-locations @FR8
  f.Scenario(
    "The other open tab receives the coordinates",
    ({ Given, When, Then }) => {
      Given(
        "the stored list holds Kazan without coordinates and a second tab shows the list",
        () => {
          storedLocations = [buildCityLocation("Kazan")];
          hasOtherTab = true;
        },
      );
      When(
        "the app is opened and the city data finishes loading",
        whenOpenedAndLoaded,
      );
      Then("Kazan holds the coordinates 55.8, 49.1 in the second tab", () =>
        waitFor(() =>
          expect(
            otherTab?.result.current.locations.find(
              ({ label }) => label === "Kazan",
            )?.coordinates,
          ).toEqual(KAZAN_COORDINATES),
        ),
      );
    },
  );
});
