import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  checkAlmatyDayStops,
  type FreshModules,
  restoreZoneData,
  startOnOutdatedZoneData,
} from "./legacyZoneWorld";

const feature = await loadFeature(
  "../browser_compatibility_legacy_zones.feature",
);

const UTC_PREFIX = "UTC";
const LANGUAGE = "en";
const NO_COUNTRY = "";
const MINUTE_PRECISION = 6;

type DayStops = Awaited<ReturnType<typeof checkAlmatyDayStops>>;
type AddOutcome = ReturnType<FreshModules["model"]["reduceLocations"]>;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let engine: Awaited<ReturnType<typeof startOnOutdatedZoneData>>;
  let instantText = "";
  let addOutcome: AddOutcome;
  let withoutBigInt: DayStops;

  const addLocation = (label: string, timeZoneId: string) => {
    const { model } = engine.modules;
    addOutcome = model.reduceLocations(model.INITIAL_WORLD_CLOCK_STATE, {
      type: model.LocationCommandType.ADD_LOCATION,
      label,
      timeZoneId,
      countryCode: NO_COUNTRY,
    });
  };
  const givenOutdatedZoneData = async () => {
    engine = await startOnOutdatedZoneData();
  };
  const expectNativeRejectedKyiv = () => {
    expect(engine.rejectedZones.map((zone) => zone.toLowerCase())).toContain(
      "europe/kyiv",
    );
  };

  f.AfterEachScenario(restoreZoneData);

  // @support-legacy-ios-12-safari @FR3
  f.Scenario(
    "Zone checks work without BigInt",
    ({ Given, When, Then, And }) => {
      Given("the engine has no BigInt", () => undefined);
      When(
        "the zone {string} is checked and its day-period colours are computed for {string}",
        async (_ctx, _zone: string, date: string) => {
          withoutBigInt = await checkAlmatyDayStops(date, false);
        },
      );
      Then("the zone is accepted", () => {
        expect(withoutBigInt.canonicalZone).toBe("Asia/Almaty");
      });
      And(
        "the colour stops equal those computed with BigInt present",
        async () => {
          const withBigInt = await checkAlmatyDayStops("2026-03-08", true);
          expect(withoutBigInt.stops.length).toBeGreaterThan(0);
          expect(withoutBigInt.stops.map((stop) => stop.period)).toEqual(
            withBigInt.stops.map((stop) => stop.period),
          );
          withoutBigInt.stops.forEach((stop, stopIndex) => {
            expect(stop.fraction).toBeCloseTo(
              withBigInt.stops[stopIndex].fraction,
              MINUTE_PRECISION,
            );
          });
        },
      );
    },
  );

  // @support-legacy-ios-12-safari @FR4
  f.Scenario("Adding a renamed zone", ({ Given, When, Then }) => {
    Given(
      "the engine rejects {string} and accepts {string}",
      givenOutdatedZoneData,
    );
    When(
      "the user adds {string} with the zone {string}",
      (_ctx, label: string, zone: string) => addLocation(label, zone),
    );
    Then(
      "the location is added with the zone {string}",
      (_ctx, zone: string) => {
        expectNativeRejectedKyiv();
        expect(addOutcome.ok).toBe(true);
        if (addOutcome.ok) {
          expect(addOutcome.state.locations.map((l) => l.timeZoneId)).toEqual([
            zone,
          ]);
        }
      },
    );
  });

  // @support-legacy-ios-12-safari @FR4
  f.Scenario("A renamed zone shows its time", ({ Given, And, When, Then }) => {
    Given(
      "the engine rejects {string} and accepts {string}",
      givenOutdatedZoneData,
    );
    And("the current instant is {string}", (_ctx, instant: string) => {
      instantText = instant;
    });
    let card = { time: "", offset: "" };
    When(
      "the app shows {string} with the zone {string}",
      (_ctx, _label: string, zone: string) => {
        const { model, presenter, temporal } = engine.modules;
        const instant = temporal.Temporal.Instant.from(instantText);
        const local = model.getLocalDateTime(zone, instant);
        const offsetMinutes = model.getUtcOffsetMinutes(zone, instant);
        card = {
          time: local ? presenter.formatLocalTime(local, LANGUAGE) : "",
          offset:
            offsetMinutes === undefined
              ? ""
              : presenter.formatUtcOffset(offsetMinutes, UTC_PREFIX),
        };
      },
    );
    Then(
      "the {string} card shows {string} and {string}",
      (_ctx, _label: string, time: string, offset: string) => {
        expectNativeRejectedKyiv();
        expect(card).toEqual({ time, offset });
      },
    );
  });

  // @support-legacy-ios-12-safari @FR4 @M3
  f.ScenarioOutline(
    "A wall-clock time in a renamed zone",
    ({ Given, When, Then }, variables) => {
      let resolved: ReturnType<FreshModules["model"]["resolveWallClock"]>;
      Given(
        "the engine rejects {string} and accepts {string}",
        givenOutdatedZoneData,
      );
      When(
        "the wall-clock time <wall clock> in {string} is resolved",
        (_ctx, zone: string) => {
          const { model, temporal } = engine.modules;
          resolved = model.resolveWallClock(
            zone,
            temporal.Temporal.PlainDateTime.from(variables["wall clock"]),
          );
        },
      );
      Then("it resolves to <instant> with the status <status>", () => {
        expectNativeRejectedKyiv();
        expect(resolved.instant.toString()).toBe(
          engine.modules.temporal.Temporal.Instant.from(
            variables.instant,
          ).toString(),
        );
        expect(resolved.status).toBe(variables.status);
      });
    },
  );

  // @support-legacy-ios-12-safari @FR4
  f.Scenario("A zone rejected under every name", ({ Given, When, Then }) => {
    Given(
      "the engine rejects {string} under every name",
      givenOutdatedZoneData,
    );
    When(
      "the user adds {string} with the zone {string}",
      (_ctx, label: string, zone: string) => addLocation(label, zone),
    );
    Then("the location is rejected as an unknown time zone", () => {
      expect(addOutcome).toEqual({
        ok: false,
        error: engine.modules.model.LocationErrorCode.UNKNOWN_TIME_ZONE,
      });
    });
  });
});
