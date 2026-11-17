// Verifies FR8, NFR-P2, M3 of apply-data-updates-silently.
import { describe, expect, it } from "vitest";
import {
  AFTER_LAST_CHANGE_SECONDS,
  COMPARISON_SECONDS,
  changesWith,
  createZone,
  IN_FORCE_INDEX,
  instantSeconds,
  LATER_INDEX,
  lisbonLikeChanges,
  PAST_INDEX,
  SUMMER,
  WINTER,
} from "@/test/zoneRules/lisbonLikeZone";
import { parseFutureRule } from "./futureRule.ts";
import { hasZoneRulesChangeFrom } from "./zoneRulesDifference.ts";

describe("hasZoneRulesChangeFrom", () => {
  it("should find no change between equal rules", () => {
    expect(
      hasZoneRulesChangeFrom(createZone(), createZone(), COMPARISON_SECONDS),
    ).toBe(false);
  });

  it.each([
    [
      "the UTC offset in force",
      createZone({
        changes: changesWith(IN_FORCE_INDEX, {
          localTimeType: { ...WINTER, utcOffsetSeconds: 1800 },
        }),
      }),
    ],
    [
      "the designation in force",
      createZone({
        changes: changesWith(IN_FORCE_INDEX, {
          localTimeType: { ...WINTER, designation: "GMT" },
        }),
      }),
    ],
    [
      "the daylight-saving flag in force alone",
      createZone({
        changes: changesWith(IN_FORCE_INDEX, {
          localTimeType: { ...WINTER, isDaylightSavingTime: true },
        }),
      }),
    ],
    [
      "the instant of a later clock change",
      createZone({
        changes: changesWith(LATER_INDEX, {
          epochSeconds: instantSeconds("2027-03-29T01:00:00Z"),
        }),
      }),
    ],
    [
      "the offset a later clock change starts",
      createZone({
        changes: changesWith(LATER_INDEX, {
          localTimeType: { ...SUMMER, utcOffsetSeconds: 7200 },
        }),
      }),
    ],
    [
      "the rule after the listed changes",
      createZone({ futureRule: parseFutureRule("WET0WEST,M3.4.0/1,M10.5.0") }),
    ],
  ])("should count a difference in %s", (_kind, storedRules) => {
    expect(
      hasZoneRulesChangeFrom(createZone(), storedRules, COMPARISON_SECONDS),
    ).toBe(true);
  });

  it("should not count a difference in the past", () => {
    const storedRules = createZone({
      changes: changesWith(PAST_INDEX, {
        epochSeconds: instantSeconds("2009-03-28T01:00:00Z"),
      }),
    });
    expect(
      hasZoneRulesChangeFrom(createZone(), storedRules, COMPARISON_SECONDS),
    ).toBe(false);
  });

  it("should not count a difference of the cutoff type", () => {
    const storedRules = createZone({
      cutoffType: { ...WINTER, designation: "GMT" },
    });
    expect(
      hasZoneRulesChangeFrom(createZone(), storedRules, COMPARISON_SECONDS),
    ).toBe(false);
  });

  it("should compare the rule in force after the last listed clock change", () => {
    const storedRules = createZone({
      futureRule: parseFutureRule("WET0WEST,M3.4.0/1,M10.5.0"),
    });
    expect(
      hasZoneRulesChangeFrom(
        createZone(),
        storedRules,
        AFTER_LAST_CHANGE_SECONDS,
      ),
    ).toBe(true);
  });

  it("should not count a changed past clock change when a later one is equal", () => {
    const storedRules = createZone({
      changes: changesWith(PAST_INDEX, {
        epochSeconds: instantSeconds("2009-03-28T01:00:00Z"),
      }),
    });
    expect(
      hasZoneRulesChangeFrom(createZone(), storedRules, COMPARISON_SECONDS),
    ).toBe(false);
  });

  it("should count a missing later clock change", () => {
    const storedRules = createZone({
      changes: lisbonLikeChanges().slice(0, 5),
    });
    expect(
      hasZoneRulesChangeFrom(createZone(), storedRules, COMPARISON_SECONDS),
    ).toBe(true);
  });

  it("should count a future rule that one release lacks", () => {
    expect(
      hasZoneRulesChangeFrom(
        createZone(),
        createZone({ futureRule: undefined }),
        COMPARISON_SECONDS,
      ),
    ).toBe(true);
  });

  it("should treat equal rules held as separate objects as unchanged", () => {
    const sameRules = createZone();
    expect(
      hasZoneRulesChangeFrom(
        sameRules,
        structuredClone(sameRules),
        COMPARISON_SECONDS,
      ),
    ).toBe(false);
  });
});
