// Verifies FR8, NFR-P2, M3 of apply-data-updates-silently.
import { describe, expect, it, vi } from "vitest";
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
  releaseOf,
  SUMMER,
  WINTER,
} from "@/test/zoneRules/lisbonLikeZone";
import { parseFutureRule } from "./futureRule.ts";
import {
  findChangedZones,
  hasZoneRulesChangeFrom,
} from "./zoneRulesDifference.ts";

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

describe("findChangedZones", () => {
  const LISBON = "Europe/Lisbon";
  const MOSCOW = "Europe/Moscow";

  it("should list only the zones whose rules changed", () => {
    const changedLisbon = createZone({ futureRule: undefined });
    const active = releaseOf({
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
    });
    const stored = releaseOf({
      [LISBON]: changedLisbon,
      [MOSCOW]: createZone(),
    });
    expect(
      findChangedZones(active, stored, [LISBON, MOSCOW], COMPARISON_SECONDS),
    ).toEqual([LISBON]);
  });

  it("should count a zone that only the active release holds", () => {
    const active = releaseOf({ [LISBON]: createZone() });
    expect(
      findChangedZones(active, releaseOf({}), [LISBON], COMPARISON_SECONDS),
    ).toEqual([LISBON]);
  });

  it("should count a zone that only the stored release holds", () => {
    const stored = releaseOf({ [LISBON]: createZone() });
    expect(
      findChangedZones(releaseOf({}), stored, [LISBON], COMPARISON_SECONDS),
    ).toEqual([LISBON]);
  });

  it("should not count a zone that neither release holds", () => {
    expect(
      findChangedZones(
        releaseOf({}),
        releaseOf({}),
        [LISBON],
        COMPARISON_SECONDS,
      ),
    ).toEqual([]);
  });

  it("should ignore a zone that is not asked for", () => {
    const active = releaseOf({ [LISBON]: createZone() });
    const stored = releaseOf({
      [LISBON]: createZone({ futureRule: undefined }),
    });
    expect(findChangedZones(active, stored, [], COMPARISON_SECONDS)).toEqual(
      [],
    );
  });

  it("should compare a link by the rules it leads to", () => {
    const sharedRules = createZone();
    const active = releaseOf({ "Africa/Luanda": sharedRules });
    const stored = releaseOf({ "Africa/Luanda": structuredClone(sharedRules) });
    expect(
      findChangedZones(active, stored, ["Africa/Luanda"], COMPARISON_SECONDS),
    ).toEqual([]);
  });

  it("should read each given zone once from each release", () => {
    const active = releaseOf({
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
    });
    const stored = releaseOf({
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
    });
    const activeRead = vi.spyOn(active.zones, "get");
    const storedRead = vi.spyOn(stored.zones, "get");
    findChangedZones(active, stored, [LISBON, MOSCOW], COMPARISON_SECONDS);
    expect(activeRead).toHaveBeenCalledTimes(2);
    expect(storedRead).toHaveBeenCalledTimes(2);
  });
});
