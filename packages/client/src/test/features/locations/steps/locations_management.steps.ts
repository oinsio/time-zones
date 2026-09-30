import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  createStore,
  LocationCommandType,
  LocationErrorCode,
  type LocationsState,
  reduceLocations,
} from "@/model";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";

const feature = await loadFeature("../locations_management.feature");

const EMPTY_STATE: LocationsState = { locations: [] };

type CommandOutcome = ReturnType<typeof reduceLocations>;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let store = createStore(reduceLocations, EMPTY_STATE);
  let snapshotBefore: LocationsState = EMPTY_STATE;
  let outcome: CommandOutcome | undefined;

  const seed = (...cityLabels: string[]) => {
    store = createStore(reduceLocations, {
      locations: cityLabels.map((label) =>
        buildLocation({ label, ...KNOWN_CITIES[label] }),
      ),
    });
    snapshotBefore = store.getSnapshot();
  };
  const addCity = (label: string) => {
    const city = KNOWN_CITIES[label];
    outcome = store.dispatch({
      type: LocationCommandType.ADD_LOCATION,
      label,
      timeZoneId: city?.timeZoneId ?? "",
      countryCode: city?.countryCode ?? "",
    });
  };
  const removeCity = (label: string) => {
    const city = KNOWN_CITIES[label];
    outcome = store.dispatch({
      type: LocationCommandType.REMOVE_LOCATION,
      id: buildLocation({ label, ...city }).id,
    });
  };
  const addWithZone = (label: string, timeZoneId: string) => {
    outcome = store.dispatch({
      type: LocationCommandType.ADD_LOCATION,
      label,
      timeZoneId,
      countryCode: "",
    });
  };
  const expectRejection = (error: LocationErrorCode) => {
    expect(outcome).toEqual({ ok: false, error });
  };
  const expectListUnchanged = () => {
    expect(store.getSnapshot()).toBe(snapshotBefore);
  };
  const expectLabels = (labels: string[]) => {
    expect(store.getSnapshot().locations.map(({ label }) => label)).toEqual(
      labels,
    );
  };
  const splitLabels = (text: string) => text.split(/,\s*|\s+and\s+/);

  f.BeforeEachScenario(() => {
    seed();
    outcome = undefined;
  });

  // @add-locations-via-search @FR9
  f.Scenario(
    "Legacy identifier is canonicalized on input",
    ({ When, Then }) => {
      When(
        "a location with the zone {string} is added",
        (_ctx, zone: string) => {
          addWithZone("Kolkata", zone);
        },
      );
      Then("the list holds it with the zone {string}", (_ctx, zone: string) => {
        expect(store.getSnapshot().locations.map((l) => l.timeZoneId)).toEqual([
          zone,
        ]);
      });
    },
  );

  // @add-locations-via-search @FR9
  f.Scenario(
    "Duplicate by canonical identifier",
    ({ Given, When, Then, And }) => {
      Given(
        "the list contains {string} in {string}",
        (_ctx, label: string, zone: string) => {
          seed();
          addWithZone(label, zone);
          snapshotBefore = store.getSnapshot();
        },
      );
      When(
        "{string} in {string} is added",
        (_ctx, label: string, zone: string) => {
          addWithZone(label, zone);
        },
      );
      Then("the addition is rejected as a duplicate location", () => {
        expectRejection(LocationErrorCode.DUPLICATE_LOCATION);
      });
      And("the list is unchanged", expectListUnchanged);
    },
  );

  // @add-locations-via-search @FR9
  f.Scenario("Raw offset is rejected", ({ When, Then, And }) => {
    When("a location with the zone {string} is added", (_ctx, zone: string) => {
      addWithZone("Offset", zone);
    });
    Then("the addition is rejected as an unknown time zone", () => {
      expectRejection(LocationErrorCode.UNKNOWN_TIME_ZONE);
    });
    And("the list is unchanged", expectListUnchanged);
  });

  // @add-locations-via-search @FR9
  f.Scenario("Unknown zone is rejected", ({ When, Then }) => {
    When("a location with the zone {string} is added", (_ctx, zone: string) => {
      addWithZone("Mars", zone);
    });
    Then("the addition is rejected as an unknown time zone", () => {
      expectRejection(LocationErrorCode.UNKNOWN_TIME_ZONE);
    });
  });

  // @add-locations-via-search @FR8
  f.Scenario("First location", ({ Given, When, Then }) => {
    Given("the list is empty", () => seed());
    When("the user adds New York", () => addCity("New York"));
    Then("the list contains exactly New York", () => {
      expectLabels(["New York"]);
    });
  });

  // @add-locations-via-search @FR8
  f.Scenario("Order is kept", ({ Given, When, Then }) => {
    Given("the list contains Almaty and Moscow", () =>
      seed("Almaty", "Moscow"),
    );
    When("the user adds Kolkata", () => addCity("Kolkata"));
    Then("the list is Almaty, Moscow, Kolkata in that order", () => {
      expectLabels(["Almaty", "Moscow", "Kolkata"]);
    });
  });

  // @add-locations-via-search @FR10
  f.Scenario("Remove from the middle", ({ Given, When, Then }) => {
    Given("the list is Almaty, Moscow, Kolkata", () =>
      seed(...splitLabels("Almaty, Moscow, Kolkata")),
    );
    When("the user removes Moscow", () => removeCity("Moscow"));
    Then("the list is Almaty, Kolkata in that order", () => {
      expectLabels(["Almaty", "Kolkata"]);
    });
  });

  // @add-locations-via-search @FR10
  f.Scenario("Remove the last location", ({ Given, When, Then }) => {
    Given("the list contains only Moscow", () => seed("Moscow"));
    When("the user removes Moscow", () => removeCity("Moscow"));
    Then("the list is empty", () => {
      expect(store.getSnapshot().locations).toEqual([]);
    });
  });

  // @add-locations-via-search @FR10
  f.Scenario("Location already gone", ({ Given, When, Then, And }) => {
    Given("Moscow was removed in another tab", () => seed());
    When("a removal of Moscow arrives", () => removeCity("Moscow"));
    Then("it is reported as location not found", () => {
      expectRejection(LocationErrorCode.LOCATION_NOT_FOUND);
    });
    And("the list is unchanged", expectListUnchanged);
  });
});
