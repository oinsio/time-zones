// FR9, FR12 of add-locations-via-search: validating a stored payload (D4).
// Verifies FR8, FR9 of set-home-location-and-show-differences (D6): the home location id.
// Verifies FR7 of add-city-coordinates-to-locations (D6): optional coordinates.
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
import { parseStoredLocations } from "./parseStoredLocations";

describe("parseStoredLocations coordinates", () => {
  const moscow = {
    timeZoneId: "Europe/Moscow",
    label: "Moscow",
    countryCode: "RU",
  };
  const parseWith = (coordinates: unknown) =>
    parseStoredLocations({ locations: [{ ...moscow, coordinates }] });

  // @add-city-coordinates-to-locations @FR7
  it("should read the coordinates of a city entry", () => {
    const outcome = parseWith({ latitude: 55.8, longitude: 37.6 });
    expect(outcome.ok && outcome.locations[0]?.coordinates).toEqual({
      latitude: 55.8,
      longitude: 37.6,
    });
  });

  it("should read an entry without coordinates as a location without", () => {
    const outcome = parseStoredLocations({ locations: [moscow] });
    expect(outcome.ok && outcome.locations[0]?.coordinates).toBeUndefined();
  });

  it.each([
    ["a latitude and no longitude", { latitude: 55.8 }],
    ["the latitude as text", { latitude: "55.8", longitude: 37.6 }],
    ["the latitude 91", { latitude: 91, longitude: 37.6 }],
    ["the longitude -181", { latitude: 55.8, longitude: -181 }],
    ["null", null],
    ["an array", [55.8, 37.6]],
  ])("should reject the document for %s", (_, coordinates) => {
    expect(parseWith(coordinates)).toEqual({ ok: false });
  });

  // @add-city-coordinates-to-locations @FR7
  it("should reject a device time entry that holds coordinates", () => {
    expect(
      parseStoredLocations({
        locations: [
          {
            kind: LocationKind.DEVICE_TIME,
            coordinates: { latitude: 1, longitude: 2 },
          },
        ],
      }),
    ).toEqual({ ok: false });
  });
});
