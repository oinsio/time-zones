// Verifies FR8, NFR-P2, M3 of apply-data-updates-silently.
import { describe, expect, it, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { parseFutureRule } from "./futureRule.ts";
import { MILLISECONDS_PER_SECOND } from "./zoneRulesConstants.ts";
import {
  findChangedZones,
  hasZoneRulesChangeFrom,
} from "./zoneRulesDifference.ts";
import type {
  ListedClockChange,
  LocalTimeType,
  ZoneRules,
  ZoneRulesRelease,
} from "./zoneRulesRelease.ts";

const instantSeconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND;
const COMPARISON_SECONDS = instantSeconds("2026-11-15T12:00:00Z");
const AFTER_LAST_CHANGE_SECONDS = instantSeconds("2031-06-01T12:00:00Z");

const WINTER: LocalTimeType = {
  utcOffsetSeconds: 0,
  designation: "WET",
  isDaylightSavingTime: false,
};
const SUMMER: LocalTimeType = {
  utcOffsetSeconds: 3600,
  designation: "WEST",
  isDaylightSavingTime: true,
};
const MARCH_2027 = "2027-03-28T01:00:00Z";
const OCTOBER_2027 = "2027-10-31T01:00:00Z";
const FUTURE_RULE_TEXT = "WET0WEST,M3.5.0/1,M10.5.0";

const clockChange = (
  instant: string,
  localTimeType: LocalTimeType,
): ListedClockChange => ({
  epochSeconds: instantSeconds(instant),
  localTimeType,
});

/** Indexes: 0 and 1 in the past, 2 starts 2026 summer, 3 is in force at the comparison, 4 and 5 are later. */
const lisbonLikeChanges = (): ListedClockChange[] => [
  clockChange("2009-03-29T01:00:00Z", SUMMER),
  clockChange("2009-10-25T01:00:00Z", WINTER),
  clockChange("2026-03-29T01:00:00Z", SUMMER),
  clockChange("2026-10-25T01:00:00Z", WINTER),
  clockChange(MARCH_2027, SUMMER),
  clockChange(OCTOBER_2027, WINTER),
];
const IN_FORCE_INDEX = 3;
const LATER_INDEX = 4;
const PAST_INDEX = 0;

function createZone(overrides: Partial<ZoneRules> = {}): ZoneRules {
  return {
    types: [WINTER, SUMMER],
    cutoffType: WINTER,
    changes: lisbonLikeChanges(),
    futureRule: parseFutureRule(FUTURE_RULE_TEXT),
    ...overrides,
  };
}

const changesWith = (
  index: number,
  change: Partial<ListedClockChange>,
): ListedClockChange[] =>
  lisbonLikeChanges().map((listed, position) =>
    position === index ? { ...listed, ...change } : listed,
  );

const releaseOf = (
  zones: Record<string, ZoneRules>,
  release = "2026f",
): ZoneRulesRelease => ({ release, zones: new Map(Object.entries(zones)) });

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
