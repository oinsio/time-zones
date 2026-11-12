import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { needsLegacySupport } from "@/lib/legacy";
import { HourFormat } from "@/preferences";
import {
  checkAlmatyDayStops,
  restoreZoneData,
  startOnOutdatedZoneData,
} from "./legacyZoneWorld";

const feature = await loadFeature(
  "../browser_compatibility_legacy_zones.feature",
);

const KYIV_ZONE_ID = "Europe/Kyiv";
const KYIV_INSTANT = "2026-03-08T07:30:00Z";
const KYIV_TIME = "09:30";
const LANGUAGE = "en";
const MINUTE_PRECISION = 6;

type DayStops = Awaited<ReturnType<typeof checkAlmatyDayStops>>;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let engine: Awaited<ReturnType<typeof startOnOutdatedZoneData>>;
  let withoutBigInt: DayStops;

  const givenOutdatedZoneData = async () => {
    engine = await startOnOutdatedZoneData();
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

  // @add-zone-rules-from-iana @FR5
  f.Scenario(
    "Outdated zone data alone needs no polyfills",
    ({ Given, And, When, Then }) => {
      let isLegacySupportNeeded = true;
      Given("the engine has every required built-in", () => undefined);
      And("the engine rejects {string}", givenOutdatedZoneData);
      When("the app starts", () => {
        isLegacySupportNeeded = needsLegacySupport();
      });
      Then("the polyfills are not requested", () => {
        expect(isLegacySupportNeeded).toBe(false);
      });
      And("Kyiv shows its time from the zone rules", () => {
        const { model, presenter, temporal } = engine.modules;
        const instant = temporal.Temporal.Instant.from(KYIV_INSTANT);
        const local = model.getLocalDateTime(KYIV_ZONE_ID, instant);
        expect(local).toBeDefined();
        expect(
          local && presenter.formatLocalTime(local, LANGUAGE, HourFormat.H24),
        ).toBe(KYIV_TIME);
        expect(engine.calls.map((call) => call.timeZone)).not.toContain(
          KYIV_ZONE_ID,
        );
      });
    },
  );
});
