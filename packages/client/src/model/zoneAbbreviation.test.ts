// Verifies FR1, FR2 of show-zone-abbreviations-and-zone-label-setting.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getZoneAbbreviation, getZoneAbbreviations } from "./zoneAbbreviation";

function abbreviationAt(zone: string, instant: string): string | undefined {
  return getZoneAbbreviation(
    zone,
    Temporal.Instant.from(instant).toZonedDateTimeISO(zone),
  );
}

const JANUARY = "2026-01-15T12:00:00Z";
const JULY = "2026-07-15T12:00:00Z";

describe("getZoneAbbreviation", () => {
  it.each([
    ["America/New_York", JANUARY, "EST"],
    ["America/New_York", JULY, "EDT"],
    ["Europe/Dublin", JANUARY, "GMT"],
    ["Europe/Dublin", JULY, "IST"],
    ["Australia/Sydney", JANUARY, "AEDT"],
    ["Australia/Sydney", JULY, "AEST"],
    ["Australia/Adelaide", JANUARY, "ACDT"],
    ["Asia/Kolkata", JULY, "IST"],
    ["Europe/Moscow", JULY, "MSK"],
    ["America/Panama", JULY, "EST"],
    ["UTC", JULY, "UTC"],
  ])("gives %s at %s the abbreviation %s", (zone, instant, expected) => {
    expect(abbreviationAt(zone, instant)).toBe(expected);
  });

  it.each([
    ["2026-03-08T06:59:00Z", "EST"],
    ["2026-03-08T07:30:00Z", "EDT"],
  ])(
    "gives New York at %s the abbreviation %s around the clock change",
    (instant, expected) => {
      expect(abbreviationAt("America/New_York", instant)).toBe(expected);
    },
  );

  it.each(["Asia/Almaty", "Asia/Dubai", "Asia/Singapore", "America/Sao_Paulo"])(
    "gives %s no abbreviation because tzdb names it numerically",
    (zone) => {
      expect(abbreviationAt(zone, JULY)).toBeUndefined();
    },
  );

  it("gives an unknown zone no abbreviation", () => {
    const utcMoment = Temporal.Instant.from(JULY).toZonedDateTimeISO("UTC");
    expect(getZoneAbbreviation("Mars/Olympus_Mons", utcMoment)).toBeUndefined();
  });

  it("reads the table entry of the identifier given, not of the moment's own zone name", () => {
    const utcMoment = Temporal.Instant.from(JULY).toZonedDateTimeISO("UTC");
    expect(getZoneAbbreviation("Europe/Moscow", utcMoment)).toBe("MSK");
  });
});

describe("getZoneAbbreviations", () => {
  it.each([
    ["America/New_York", ["EST", "EDT"]],
    ["Europe/Dublin", ["GMT", "IST"]],
    ["Asia/Jerusalem", ["IST", "IDT"]],
    ["Australia/Sydney", ["AEST", "AEDT"]],
    ["Asia/Kolkata", ["IST"]],
    ["America/Panama", ["EST"]],
    ["Asia/Almaty", []],
    ["Mars/Olympus_Mons", []],
  ])("gives %s the pair %j", (zone, expected) => {
    expect(getZoneAbbreviations(zone)).toEqual(expected);
  });
});
