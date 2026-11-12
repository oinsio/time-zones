// @add-zone-rules-from-iana @FR9: the zone abbreviation table is built from the release
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { extractZoneAbbreviations } from "../../../scripts/zoneData/extractZoneAbbreviations.ts";
import { readReleaseZonePeriods } from "../../../scripts/zoneRules/releaseZonePeriods.ts";
import { committedRelease } from "../installZoneRules";
import before from "./fixtures/zone-abbreviations.before.json";
import changesFile from "./fixtures/zone-abbreviations.changes.json";

/** A zone whose designations an IANA release note changed. */
type ZoneAbbreviationChange = {
  release: string;
  before: string[];
  after: string[];
};
const changes: Record<string, ZoneAbbreviationChange> = changesFile;

const toMilliseconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds;
const YEAR_2026_START_MILLISECONDS = toMilliseconds("2026-01-01T00:00:00Z");
const CUTOFF_MILLISECONDS = toMilliseconds("2000-01-01T00:00:00Z");
const NEW_YORK_SPRING_FORWARD = toMilliseconds("2026-03-08T07:00:00Z");
const NEW_YORK_FALL_BACK = toMilliseconds("2026-11-01T06:00:00Z");
const UNKNOWN_ZONE_ID = "Mars/Olympus_Mons";

function readPeriods(zoneId: string) {
  return readReleaseZonePeriods(committedRelease, zoneId) ?? [];
}

describe("readReleaseZonePeriods", () => {
  it("lists the periods of New York around 2026 with their exact transitions", () => {
    const periods = readPeriods("America/New_York").filter(
      (period) => period.untilEpochMilliseconds > YEAR_2026_START_MILLISECONDS,
    );

    expect(
      periods
        .slice(0, 3)
        .map((period) => [period.designation, period.untilEpochMilliseconds]),
    ).toEqual([
      ["EST", NEW_YORK_SPRING_FORWARD],
      ["EDT", NEW_YORK_FALL_BACK],
      ["EST", toMilliseconds("2027-03-14T07:00:00Z")],
    ]);
  });

  it("gives the offsets of the periods in minutes east of UTC", () => {
    const [winter, summer] = readPeriods("America/New_York").filter(
      (period) => period.untilEpochMilliseconds > YEAR_2026_START_MILLISECONDS,
    );

    expect([winter?.utcOffsetMinutes, summer?.utcOffsetMinutes]).toEqual([
      -300, -240,
    ]);
  });

  it("gives Almaty one period with a numeric designation", () => {
    expect(
      readPeriods("Asia/Almaty").filter(
        (period) =>
          period.untilEpochMilliseconds > YEAR_2026_START_MILLISECONDS,
      ),
    ).toEqual([
      {
        designation: "+05",
        utcOffsetMinutes: 300,
        untilEpochMilliseconds: Infinity,
      },
    ]);
  });

  it("gives Dublin GMT and IST from its future rule", () => {
    const designations = readPeriods("Europe/Dublin")
      .filter(
        (period) =>
          period.untilEpochMilliseconds > YEAR_2026_START_MILLISECONDS,
      )
      .map((period) => period.designation);

    expect(new Set(designations)).toEqual(new Set(["GMT", "IST"]));
  });

  it("gives a zone with listed changes after the cutoff the cutoff type first", () => {
    const [firstPeriod] = readPeriods("Europe/Moscow");

    expect(firstPeriod?.untilEpochMilliseconds).toBeGreaterThan(
      CUTOFF_MILLISECONDS,
    );
  });

  it("returns nothing for a zone outside the release", () => {
    expect(
      readReleaseZonePeriods(committedRelease, UNKNOWN_ZONE_ID),
    ).toBeUndefined();
  });
});

describe("the abbreviation table built from the release", () => {
  const zoneIds = [...Object.keys(before), "UTC"];
  const table = extractZoneAbbreviations(zoneIds, (zoneId) =>
    readReleaseZonePeriods(committedRelease, zoneId),
  );
  const changedZoneIds = new Set(Object.keys(changes));

  it("keeps the abbreviations of every zone of the table before, except the listed ones", () => {
    const differences = Object.entries(before)
      .filter(
        ([zoneId, abbreviations]) =>
          !changedZoneIds.has(zoneId) &&
          JSON.stringify(table[zoneId]) !== JSON.stringify(abbreviations),
      )
      .map(([zoneId]) => zoneId);

    expect(differences).toEqual([]);
  });

  it.each(Object.entries(changes))(
    "lists %s with the release whose note changed it",
    (zoneId, change) => {
      expect(change.release).toMatch(/^20\d\d[a-z]$/);
      expect(table[zoneId]).toEqual(change.after);
      expect(before[zoneId as keyof typeof before]).toEqual(change.before);
    },
  );
});
