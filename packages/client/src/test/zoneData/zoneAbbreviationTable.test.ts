// Verifies FR1, FR4, NFR-P2, M1, M2, M8 of show-zone-abbreviations-and-zone-label-setting.
import { gzipSync } from "node:zlib";
import zoneAbbreviations from "virtual:zone-abbreviations";
import { describe, expect, it } from "vitest";

const MAX_GZIPPED_BYTES = 5 * 1024;
const REMOVED_ABBREVIATIONS = [
  "ET",
  "PT",
  "ALMT",
  "ICT",
  "SGT",
  "GST",
  "BRT",
  "ART",
];

describe("virtual:zone-abbreviations", () => {
  it.each([
    ["America/New_York", ["EST", "EDT"]],
    ["Europe/Dublin", ["GMT", "IST"]],
    ["Asia/Jerusalem", ["IST", "IDT"]],
    ["Asia/Kolkata", ["IST"]],
    ["Europe/Moscow", ["MSK"]],
    ["America/Panama", ["EST"]],
    ["Australia/Adelaide", ["ACST", "ACDT"]],
    ["Europe/London", ["GMT", "BST"]],
    ["UTC", ["UTC"]],
  ])("gives %s the pair %j", (zoneId, expected) => {
    expect(zoneAbbreviations[zoneId]).toEqual(expected);
  });

  it.each([
    "Asia/Almaty",
    "Asia/Dubai",
    "Asia/Singapore",
    "America/Sao_Paulo",
    "Asia/Dhaka",
  ])("has no entry for %s, which tzdb names numerically", (zoneId) => {
    expect(zoneAbbreviations[zoneId]).toBeUndefined();
  });

  it("holds none of the abbreviations outside tzdb", () => {
    const held = Object.values(zoneAbbreviations).flat();
    expect(
      held.filter((abbreviation) =>
        REMOVED_ABBREVIATIONS.includes(abbreviation),
      ),
    ).toEqual([]);
  });

  it("gives IST to exactly Kolkata, Jerusalem and Dublin", () => {
    const zonesWithIst = Object.entries(zoneAbbreviations)
      .filter(([, pair]) => pair.includes("IST"))
      .map(([zoneId]) => zoneId);
    expect(zonesWithIst.sort()).toEqual([
      "Asia/Jerusalem",
      "Asia/Kolkata",
      "Europe/Dublin",
    ]);
  });

  it("stays within the gzipped size budget", () => {
    expect(
      gzipSync(JSON.stringify(zoneAbbreviations)).length,
    ).toBeLessThanOrEqual(MAX_GZIPPED_BYTES);
  });
});
