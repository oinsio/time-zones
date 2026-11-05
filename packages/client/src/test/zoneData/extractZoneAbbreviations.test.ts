// Verifies FR1, FR4 of show-zone-abbreviations-and-zone-label-setting.
import { describe, expect, it } from "vitest";
import {
  extractZoneAbbreviations,
  type ZonePeriod,
} from "../../../scripts/zoneData/extractZoneAbbreviations.ts";

const BEFORE_2026 = Date.UTC(2025, 5, 1);
const MARCH_2026 = Date.UTC(2026, 2, 8);
const NOVEMBER_2026 = Date.UTC(2026, 10, 1);
const AFTER_2026 = Date.UTC(2027, 5, 1);
const ALPHA_2026 = Date.UTC(2026, 3, 1);
const BETA_2026 = Date.UTC(2026, 6, 1);
const ZONE_ID = "Test/Zone";

function period(
  designation: string,
  utcOffsetMinutes: number,
  untilEpochMilliseconds: number,
): ZonePeriod {
  return { designation, utcOffsetMinutes, untilEpochMilliseconds };
}

function extractOne(periods: readonly ZonePeriod[] | undefined) {
  return extractZoneAbbreviations([ZONE_ID], () => periods)[ZONE_ID];
}

describe("extractZoneAbbreviations", () => {
  it.each([
    {
      name: "a zone with winter and summer time",
      periods: [
        period("EST", -300, MARCH_2026),
        period("EDT", -240, NOVEMBER_2026),
        period("EST", -300, Infinity),
      ],
      expected: ["EST", "EDT"],
    },
    {
      name: "a Dublin-like zone whose summer time is the higher offset",
      periods: [
        period("GMT", 0, MARCH_2026),
        period("IST", 60, NOVEMBER_2026),
        period("GMT", 0, Infinity),
      ],
      expected: ["GMT", "IST"],
    },
    {
      name: "a zone with one offset",
      periods: [period("IST", 330, Infinity)],
      expected: ["IST"],
    },
    {
      name: "a numeric lower half and a letter higher half",
      periods: [
        period("-03", -180, MARCH_2026),
        period("XDT", -120, NOVEMBER_2026),
        period("-03", -180, Infinity),
      ],
      expected: ["", "XDT"],
    },
    {
      name: "periods that ended before 2026",
      periods: [period("OLD", 100, BEFORE_2026), period("IST", 330, Infinity)],
      expected: ["IST"],
    },
    {
      name: "periods that start after 2026",
      periods: [period("IST", 330, AFTER_2026), period("NEW", 400, Infinity)],
      expected: ["IST"],
    },
    {
      name: "three offsets in 2026 keep the last two in time",
      periods: [
        period("AAA", 60, ALPHA_2026),
        period("CCC", 180, BETA_2026),
        period("BBB", 120, Infinity),
      ],
      expected: ["BBB", "CCC"],
    },
    {
      name: "a letters-only mixed-case designation",
      periods: [period("ChST", 600, Infinity)],
      expected: ["ChST"],
    },
  ])("gives $expected for $name", ({ periods, expected }) => {
    expect(extractOne(periods)).toEqual(expected);
  });

  it.each([
    {
      name: "only numeric designations",
      periods: [period("+05", 300, Infinity)],
    },
    { name: "a +0530 designation", periods: [period("+0530", 330, Infinity)] },
    { name: "an unknown zone", periods: undefined },
  ])("leaves the zone out for $name", ({ periods }) => {
    expect(extractOne(periods)).toBeUndefined();
  });

  it("builds one entry per listed zone", () => {
    const table = extractZoneAbbreviations(["A/One", "B/Two"], (zoneId) =>
      zoneId === "A/One" ? [period("IST", 330, Infinity)] : undefined,
    );
    expect(Object.keys(table)).toEqual(["A/One"]);
  });
});
