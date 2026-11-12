// @add-zone-rules-from-iana @FR8: comparing the committed release with zdump

import { describe, expect, it } from "vitest";
import {
  compareWithRelease,
  parseZdumpLines,
} from "../../../scripts/zoneRules/checkAgainstZdump.ts";
import {
  parseRelease,
  readZdumpFixture,
  release,
} from "./checkAgainstZdumpWorld";
import { FIXTURE_RELEASE_DOCUMENT } from "./fixtureReleaseDocument";

describe("compareWithRelease", () => {
  it.each(["America/New_York", "Asia/Almaty", "Europe/Dublin"])(
    "finds no difference for %s",
    (zoneId) => {
      expect(
        compareWithRelease(
          release,
          zoneId,
          parseZdumpLines(readZdumpFixture(zoneId)),
        ),
      ).toBeUndefined();
    },
  );

  it("reports the zone and the first instant of an altered New York rule", () => {
    const alteredRelease = parseRelease({
      ...FIXTURE_RELEASE_DOCUMENT,
      zones: {
        "America/New_York": {
          ...FIXTURE_RELEASE_DOCUMENT.zones["America/New_York"],
          futureRule: "EST5EDT,M3.2.0,M10.1.0",
        },
      },
    });
    const difference = compareWithRelease(
      alteredRelease,
      "America/New_York",
      parseZdumpLines(readZdumpFixture("America/New_York")),
    );
    expect(difference).toEqual({
      zoneId: "America/New_York",
      instant: "2007-11-04T05:59:59Z",
      expected: "-14400 EDT",
      actual: "-18000 EST",
    });
  });

  it("reports a zone the release does not hold", () => {
    expect(compareWithRelease(release, "Mars/Olympus_Mons", [])).toEqual({
      zoneId: "Mars/Olympus_Mons",
      instant: "-",
      expected: "a zone in zdump",
      actual: "no such zone in the release",
    });
  });

  describe("each field of the local time type", () => {
    const CUTOFF = 946684800;
    const standardRelease = parseRelease({
      release: "test",
      cutoff: CUTOFF,
      zones: {
        X: {
          types: [[3600, "A", 0]],
          cutoffType: 0,
          changes: [],
          futureRule: "",
        },
      },
    });
    const matching = {
      epochSeconds: CUTOFF + 5,
      utcOffsetSeconds: 3600,
      designation: "A",
      isDaylightSavingTime: false,
    };

    it("finds no difference when all three fields match", () => {
      expect(
        compareWithRelease(standardRelease, "X", [matching]),
      ).toBeUndefined();
    });

    it.each([
      ["the offset", { utcOffsetSeconds: 7200 }],
      ["the designation", { designation: "B" }],
      ["the daylight saving flag", { isDaylightSavingTime: true }],
    ])("finds a difference in only %s", (_description, change) => {
      expect(
        compareWithRelease(standardRelease, "X", [{ ...matching, ...change }]),
      ).toMatchObject({ zoneId: "X" });
    });
  });

  describe("between two listed instants", () => {
    const CUTOFF = 946684800;
    const entry = (
      offsetFromCutoff: number,
      utcOffsetSeconds: number,
      designation: string,
    ) => ({
      epochSeconds: CUTOFF + offsetFromCutoff,
      utcOffsetSeconds,
      designation,
      isDaylightSavingTime: false,
    });
    const zdumpEntries = [
      entry(99, 0, "A"),
      entry(100, 3600, "B"),
      entry(999, 3600, "B"),
      entry(1000, 0, "A"),
    ];
    const buildReleaseWithChanges = (changes: [number, number][]) =>
      parseRelease({
        release: "test",
        cutoff: CUTOFF,
        zones: {
          X: {
            types: [
              [0, "A", 0],
              [3600, "B", 0],
            ],
            cutoffType: 0,
            changes,
            futureRule: "",
          },
        },
      });

    it("finds no difference when the release changes exactly where zdump does", () => {
      const matching = buildReleaseWithChanges([
        [100, 1],
        [1000, 0],
      ]);
      expect(compareWithRelease(matching, "X", zdumpEntries)).toBeUndefined();
    });

    it("finds a change that the release lists but zdump does not", () => {
      const withExtraChange = buildReleaseWithChanges([
        [100, 1],
        [500, 0],
        [600, 1],
        [1000, 0],
      ]);
      expect(
        compareWithRelease(withExtraChange, "X", zdumpEntries),
      ).toMatchObject({
        zoneId: "X",
        instant: "2000-01-01T00:09:09Z",
        expected: "3600 B",
        actual: "0 A",
      });
    });
  });
});
