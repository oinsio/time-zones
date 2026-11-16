// Verifies FR7, FR8 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
import { getSunCoordinates, getZoneCoordinates } from "./sunCoordinates";

const KAZAN = { latitude: 55.8, longitude: 49.1 };

const buildLocation = (
  kind: LocationKind,
  timeZoneId: string,
  coordinates?: { latitude: number; longitude: number },
) => ({ kind, timeZoneId, coordinates });

describe("getZoneCoordinates", () => {
  it("should read the principal place of a zone in degrees", () => {
    expect(getZoneCoordinates("Europe/Moscow")).toEqual({
      latitude: 55.8,
      longitude: 37.6,
    });
  });

  it("should give none for UTC", () => {
    expect(getZoneCoordinates("UTC")).toBeUndefined();
  });

  it("should give none for a zone it does not know", () => {
    expect(getZoneCoordinates("Mars/Olympus")).toBeUndefined();
  });
});

describe("getSunCoordinates", () => {
  it("should use the own coordinates of a city location", () => {
    expect(
      getSunCoordinates(
        buildLocation(LocationKind.CITY, "Europe/Moscow", KAZAN),
      ),
    ).toEqual(KAZAN);
  });

  it("should use the zone coordinates of a city location without its own", () => {
    expect(
      getSunCoordinates(buildLocation(LocationKind.CITY, "Europe/Moscow")),
    ).toEqual(getZoneCoordinates("Europe/Moscow"));
  });

  it("should use the zone coordinates for the device time location", () => {
    expect(
      getSunCoordinates(
        buildLocation(LocationKind.DEVICE_TIME, "Europe/Minsk"),
      ),
    ).toEqual(getZoneCoordinates("Europe/Minsk"));
  });

  it("should ignore any coordinates held by the device time location", () => {
    expect(
      getSunCoordinates(
        buildLocation(LocationKind.DEVICE_TIME, "Europe/Minsk", KAZAN),
      ),
    ).toEqual(getZoneCoordinates("Europe/Minsk"));
  });

  it.each([
    ["UTC", LocationKind.CITY, "UTC"],
    ["a zone without zone coordinates", LocationKind.CITY, "Mars/Olympus"],
    [
      "a device time zone without zone coordinates",
      LocationKind.DEVICE_TIME,
      "Mars/Olympus",
    ],
  ])("should give none for %s", (_name, kind, timeZoneId) => {
    expect(getSunCoordinates(buildLocation(kind, timeZoneId))).toBeUndefined();
  });
});
