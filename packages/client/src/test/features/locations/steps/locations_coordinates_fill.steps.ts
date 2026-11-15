// Implements FR8, UX2, G2 of add-city-coordinates-to-locations: stored locations gain coordinates.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, waitFor } from "@testing-library/react/pure";
import { expect } from "vitest";
import { LocationsStatus } from "@/controller";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  buildCityLocation,
  COORDINATES_BY_LABEL,
  coordinatesOf,
  KAZAN_COORDINATES,
  MOSCOW_COORDINATES,
  openStoredList,
  parseCityNames,
  type StoredListWorld,
} from "./locationsCoordinatesWorld";

const feature = await loadFeature("../locations_coordinates_fill.feature");

const OLD_TOWN_ZONE = "Europe/Moscow";

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

  // @add-city-coordinates-to-locations @FR8 @UX2 @G2
  f.Scenario(
    "An older list gains coordinates",
    ({ Given, When, Then, And }) => {
      Given(
        "the stored list holds Moscow and Kazan without coordinates",
        () => {
          storedLocations = parseCityNames("Moscow and Kazan").map((label) =>
            buildCityLocation(label),
          );
        },
      );
      When(
        "the app is opened and the city data finishes loading",
        whenOpenedAndLoaded,
      );
      Then("Moscow holds the coordinates 55.8, 37.6", () =>
        waitFor(() =>
          expect(coordinatesOf(world, "Moscow")).toEqual(MOSCOW_COORDINATES),
        ),
      );
      And("Kazan holds the coordinates 55.8, 49.1", () =>
        waitFor(() =>
          expect(coordinatesOf(world, "Kazan")).toEqual(KAZAN_COORDINATES),
        ),
      );
      And("the list was written exactly once", expectWrites(1));
    },
  );

  // @add-city-coordinates-to-locations @FR8
  f.Scenario("A label no record bears", ({ Given, When, Then }) => {
    Given(
      "the stored list holds a location labelled {string} in {string} without coordinates",
      (_ctx, label: string, timeZoneId: string) => {
        storedLocations = [
          buildLocation({ label, timeZoneId: timeZoneId || OLD_TOWN_ZONE }),
        ];
      },
    );
    When(
      "the app is opened and the city data finishes loading",
      whenOpenedAndLoaded,
    );
    Then(
      "the location {string} holds the coordinates 55.8, 37.6 of the zone city Moscow",
      (_ctx, label: string) =>
        waitFor(() =>
          expect(coordinatesOf(world, label)).toEqual(MOSCOW_COORDINATES),
        ),
    );
  });

  // @add-city-coordinates-to-locations @FR8
  f.Scenario("UTC stays without coordinates", ({ Given, When, Then, And }) => {
    Given("the stored list holds UTC", () => {
      storedLocations = [buildCityLocation("UTC")];
    });
    When(
      "the app is opened and the city data finishes loading",
      whenOpenedAndLoaded,
    );
    Then("UTC holds no coordinates", () => {
      expect(coordinatesOf(world, "UTC")).toBeUndefined();
    });
    And("the list was not written", expectWrites(0));
  });

  // @add-city-coordinates-to-locations @FR8
  f.Scenario("Nothing to give", ({ Given, When, Then }) => {
    Given("every city location of the stored list holds coordinates", () => {
      storedLocations = ["Moscow", "Kazan"].map((label) =>
        buildCityLocation(label, COORDINATES_BY_LABEL[label]),
      );
    });
    When("the app is opened and the city data finishes loading", async () => {
      open();
      await act(async () => undefined);
    });
    Then("the list was not written", expectWrites(0));
  });

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
