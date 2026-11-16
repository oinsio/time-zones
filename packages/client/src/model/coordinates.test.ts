// Verifies FR5, FR6, FR7 of add-city-coordinates-to-locations.
import { describe, expect, it } from "vitest";
import { parseCoordinates } from "./coordinates";

describe("parseCoordinates", () => {
  it.each([
    [{ latitude: 55.8, longitude: 49.1 }],
    [{ latitude: 90, longitude: 180 }],
    [{ latitude: -90, longitude: -180 }],
    [{ latitude: 0, longitude: 0 }],
  ])("should accept %j", (value) => {
    expect(parseCoordinates(value)).toEqual(value);
  });

  it.each([
    ["a missing longitude", { latitude: 1 }],
    ["a missing latitude", { longitude: 1 }],
    ["text", { latitude: "1", longitude: 2 }],
    ["NaN", { latitude: Number.NaN, longitude: 2 }],
    ["infinity", { latitude: 1, longitude: Number.POSITIVE_INFINITY }],
    ["latitude 91", { latitude: 91, longitude: 0 }],
    ["latitude -91", { latitude: -91, longitude: 0 }],
    ["longitude 181", { latitude: 0, longitude: 181 }],
    ["longitude -181", { latitude: 0, longitude: -181 }],
    ["an array", [1, 2]],
    ["null", null],
    ["a string", "1,2"],
  ])("should reject %s", (_, value) => {
    expect(parseCoordinates(value)).toBeUndefined();
  });

  it("should return only the two fields", () => {
    expect(
      parseCoordinates({ latitude: 1, longitude: 2, extra: true }),
    ).toStrictEqual({ latitude: 1, longitude: 2 });
  });
});
