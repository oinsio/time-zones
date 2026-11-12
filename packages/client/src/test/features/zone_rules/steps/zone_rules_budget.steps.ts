// Implements NFR-P1, NFR-P3 of add-zone-rules-from-iana: work bounds, counted after the install (design D5).
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterEach, expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getLocalTimeType } from "@/lib/zoneRules";
import {
  committedRelease,
  realNativeDateTimeFormat,
} from "@/test/installZoneRules";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  CLOCK_TIME_OPTIONS,
  createWrapper,
} from "@/test/zoneRules/wrapperWorld";
import {
  ZONE_RULES_ASSET_BUDGET_KB,
  ZONE_RULES_RELEASE_FILE,
} from "../../../../../app.config";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
  presentBudgetRows,
} from "../../locations/steps/rowBudgetWorld";

const feature = await loadFeature("../zone_rules_budget.feature");

const BYTES_PER_KB = 1024;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_HOUR = 3_600_000;
const SAMPLED_INSTANT_COUNT = 100;
const START_INSTANT = Temporal.Instant.from(
  "2026-01-01T00:00:00Z",
).epochMilliseconds;

const sampledInstants = Array.from(
  { length: SAMPLED_INSTANT_COUNT },
  (_, index) => START_INSTANT + index * MILLISECONDS_PER_HOUR,
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workCount: WorkCount | undefined;

  afterEach(() => {
    workCount?.stop();
    workCount = undefined;
    vi.restoreAllMocks();
  });

  const spyOnNativeFormatToParts = () =>
    vi.spyOn(realNativeDateTimeFormat.prototype, "formatToParts");

  // @add-zone-rules-from-iana @NFR-P1
  f.Scenario("Asset budget", ({ When, Then }) => {
    let gzippedBytes = 0;
    When("the committed zone rules release is measured gzipped", () => {
      gzippedBytes = gzipSync(readFileSync(ZONE_RULES_RELEASE_FILE)).length;
    });
    Then("it is at most the asset budget", () => {
      expect(gzippedBytes).toBeLessThanOrEqual(
        ZONE_RULES_ASSET_BUDGET_KB * BYTES_PER_KB,
      );
    });
  });

  // @add-zone-rules-from-iana @NFR-P3
  f.Scenario("Work bound of a lookup", ({ When, Then, And }) => {
    let nativeFormatToParts: ReturnType<typeof spyOnNativeFormatToParts>;
    When(
      "the local time type of {string} at 100 instants is read",
      (_ctx, zoneId: string) => {
        const zoneRules = committedRelease.zones.get(zoneId);
        if (!zoneRules) throw new Error(`The release lacks ${zoneId}`);
        nativeFormatToParts = spyOnNativeFormatToParts();
        workCount = startWorkCount();
        for (const instant of sampledInstants) {
          getLocalTimeType(zoneRules, instant / MILLISECONDS_PER_SECOND);
        }
      },
    );
    Then("no Intl.DateTimeFormat is built", () => {
      expect(workCount?.formatters()).toBe(0);
    });
    And("no native formatToParts call is made", () => {
      expect(nativeFormatToParts).not.toHaveBeenCalled();
    });
  });

  // @add-zone-rules-from-iana @NFR-P3
  f.Scenario("Work bound of the wrapper", ({ When, Then, And }) => {
    const world = createWrapper();
    let nativeFormatToParts: ReturnType<typeof spyOnNativeFormatToParts>;
    When(
      "one formatter for {string} is created and split into parts at 100 instants",
      (_ctx, zoneId: string) => {
        nativeFormatToParts = spyOnNativeFormatToParts();
        const formatter = new world.Wrapper("en", {
          timeZone: zoneId,
          ...CLOCK_TIME_OPTIONS,
        });
        for (const instant of sampledInstants) formatter.formatToParts(instant);
      },
    );
    Then("exactly one native Intl.DateTimeFormat is built", () => {
      expect(world.calls).toHaveLength(1);
    });
    And("exactly 100 native formatToParts calls are made", () => {
      expect(nativeFormatToParts).toHaveBeenCalledTimes(SAMPLED_INSTANT_COUNT);
    });
  });

  // @add-zone-rules-from-iana @NFR-P1 @NFR-P3
  f.Scenario("Work bound of presenting rows", ({ When, Then }) => {
    When("50 rows are presented twice at two instants", () => {
      const locations = buildBudgetLocations(BUDGET_ROW_COUNT);
      presentBudgetRows(locations, { timestamp: BUDGET_FIRST_MOMENT });
      workCount = startWorkCount();
      presentBudgetRows(locations, { timestamp: BUDGET_SECOND_MOMENT });
    });
    Then("the second presentation builds no Intl.DateTimeFormat", () => {
      expect(workCount?.formatters()).toBe(0);
    });
  });
});
