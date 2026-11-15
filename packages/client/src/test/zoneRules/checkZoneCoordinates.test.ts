// Verifies FR3, FR4 of add-city-coordinates-to-locations (D4): the zone coordinates check.
import { describe, expect, it } from "vitest";
import { checkZoneCoordinates } from "../../../scripts/zoneRules/checkZoneCoordinates.ts";

const ZONE_CITIES = [
  {
    timeZoneId: "Europe/Moscow",
    names: { en: "Moscow", ru: "Москва" },
    countryCode: "RU",
  },
  { timeZoneId: "UTC", names: { en: "UTC", ru: "UTC" }, countryCode: "" },
];

const buildFile = (zones: Record<string, unknown>, release = "2026f") =>
  JSON.stringify({ release, zones });
const VALID = buildFile({ "Europe/Moscow": [558, 376] });

describe("checkZoneCoordinates", () => {
  it("should pass a valid file", () => {
    expect(checkZoneCoordinates(VALID, "2026f", ZONE_CITIES)).toEqual([]);
  });

  // @add-city-coordinates-to-locations @FR4
  it("should pass when UTC has no entry", () => {
    expect(
      checkZoneCoordinates(VALID, "2026f", ZONE_CITIES),
    ).not.toContainEqual(expect.stringContaining("UTC"));
  });

  it.each([
    ["not JSON", "{"],
    ["not an object", "5"],
    ["without a release", JSON.stringify({ zones: {} })],
    ["without zones", JSON.stringify({ release: "2026f" })],
    ["with zones as an array", JSON.stringify({ release: "2026f", zones: [] })],
    ["with a pair of one number", buildFile({ "Europe/Moscow": [1] })],
    ["with a text number", buildFile({ "Europe/Moscow": ["1", 2] })],
    ["with a fractional tenth", buildFile({ "Europe/Moscow": [1.5, 2] })],
  ])("should name the format of design D3 for a file %s", (_, text) => {
    expect(checkZoneCoordinates(text, "2026f", ZONE_CITIES)).toEqual([
      expect.stringContaining("not in the format of design D3"),
    ]);
  });

  it("should name both releases when the file names another one", () => {
    expect(
      checkZoneCoordinates(
        buildFile({ "Europe/Moscow": [558, 376] }, "2026e"),
        "2026f",
        ZONE_CITIES,
      ),
    ).toEqual([
      "The zone coordinates name the release 2026e, but the bundled zone rules release is 2026f",
    ]);
  });

  it.each([
    ["latitude -91", [-910, 0], "Europe/Moscow has the latitude -910"],
    ["latitude 91", [910, 0], "Europe/Moscow has the latitude 910"],
    ["longitude -181", [0, -1810], "Europe/Moscow has the longitude -1810"],
    ["longitude 181", [0, 1810], "Europe/Moscow has the longitude 1810"],
  ])("should name the zone and the coordinate for %s", (_, pair, message) => {
    expect(
      checkZoneCoordinates(
        buildFile({ "Europe/Moscow": pair }),
        "2026f",
        ZONE_CITIES,
      ),
    ).toEqual([expect.stringContaining(message)]);
  });

  it.each([[[900, 1800]], [[-900, -1800]]])(
    "should accept the limits %j",
    (pair) => {
      expect(
        checkZoneCoordinates(
          buildFile({ "Europe/Moscow": pair }),
          "2026f",
          ZONE_CITIES,
        ),
      ).toEqual([]);
    },
  );

  it("should name a zone city other than UTC whose zone has no coordinates", () => {
    expect(checkZoneCoordinates(buildFile({}), "2026f", ZONE_CITIES)).toEqual([
      "The zone city Europe/Moscow has no zone coordinates",
    ]);
  });
});
