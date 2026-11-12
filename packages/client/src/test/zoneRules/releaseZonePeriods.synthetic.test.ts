// @add-zone-rules-from-iana @FR9: periods of synthetic zones that pin the edges of the period reader
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  parseZoneRulesRelease,
  ZONE_RULES_CUTOFF_EPOCH_SECONDS,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules";
import { readReleaseZonePeriods } from "../../../scripts/zoneRules/releaseZonePeriods.ts";

const SYNTHETIC_ZONE_ID = "Test/Synthetic";

function readPeriods(zone: unknown) {
  const release = parseZoneRulesRelease({
    release: "test",
    cutoff: ZONE_RULES_CUTOFF_EPOCH_SECONDS,
    zones: { [SYNTHETIC_ZONE_ID]: zone },
  });
  if (release instanceof ZoneRulesReleaseError) throw release;
  return readReleaseZonePeriods(release, SYNTHETIC_ZONE_ID) ?? [];
}

const toMilliseconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds;

describe("a zone without a future rule", () => {
  it("ends its last listed type at infinity and each earlier type at its change", () => {
    const periods = readPeriods({
      types: [
        [3600, "AAA", 0],
        [7200, "BBB", 1],
      ],
      cutoffType: 0,
      changes: [[1000, 1]],
      futureRule: "",
    });

    expect(periods).toEqual([
      {
        designation: "AAA",
        utcOffsetMinutes: 60,
        untilEpochMilliseconds: (ZONE_RULES_CUTOFF_EPOCH_SECONDS + 1000) * 1000,
      },
      {
        designation: "BBB",
        utcOffsetMinutes: 120,
        untilEpochMilliseconds: Infinity,
      },
    ]);
  });
});

describe("a future rule that changes only one field of the type", () => {
  it("splits periods when only the designation changes", () => {
    const periods = readPeriods({
      types: [[3600, "AAA", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "AAA-1BBB-1,M3.2.0,M11.1.0",
    });

    expect(new Set(periods.map((period) => period.designation))).toEqual(
      new Set(["AAA", "BBB"]),
    );
  });

  it("splits periods when only the offset changes", () => {
    const periods = readPeriods({
      types: [[3600, "AAA", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "AAA-1AAA-2,M3.2.0,M11.1.0",
    });

    expect(new Set(periods.map((period) => period.utcOffsetMinutes))).toEqual(
      new Set([60, 120]),
    );
  });
});

describe("the window the future rule is read in", () => {
  it("starts a day before the rules year, so a change on the last days of the year before is seen", () => {
    const [firstPeriod] = readPeriods({
      types: [[3600, "AAA", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "AAA-1BBB-2,J364/0,J365/0",
    });

    expect(firstPeriod?.untilEpochMilliseconds).toBe(
      toMilliseconds("2026-12-29T23:00:00Z"),
    );
  });

  it("starts the scan at the first day, not before it", () => {
    const [firstPeriod] = readPeriods({
      types: [[0, "AAA", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "AAA0BBB-1,J1/0,J2/0",
    });

    expect(firstPeriod).toMatchObject({
      designation: "AAA",
      untilEpochMilliseconds: toMilliseconds("2026-01-01T00:00:00Z"),
    });
  });

  it("includes a change exactly at the end of the window", () => {
    const periods = readPeriods({
      types: [[0, "AAA", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "AAA0BBB-1,J1/0,J365/0",
    });

    expect(periods.slice(-2).map((period) => period.designation)).toEqual([
      "AAA",
      "BBB",
    ]);
    expect(periods.at(-2)?.untilEpochMilliseconds).toBe(
      toMilliseconds("2028-01-01T00:00:00Z"),
    );
  });
});
