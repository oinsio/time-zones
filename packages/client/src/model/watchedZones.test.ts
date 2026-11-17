// Verifies FR9 of apply-data-updates-silently.
import { describe, expect, it } from "vitest";
import { INITIAL_WORLD_CLOCK_STATE, type Location } from "./locations";
import { getWatchedZoneIds } from "./watchedZones";

const createLocation = (id: string, timeZoneId: string): Location =>
  ({ id, timeZoneId, kind: "CITY" }) as unknown as Location;

const stateWith = (locations: Location[], deviceTimeZoneId: string) => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  locations,
  deviceTimeZoneId,
});

describe("getWatchedZoneIds", () => {
  it("should list the distinct zones of the locations, then the device time zone", () => {
    const state = stateWith(
      [
        createLocation("lisbon", "Europe/Lisbon"),
        createLocation("porto", "Europe/Lisbon"),
        createLocation("cairo", "Africa/Cairo"),
      ],
      "Europe/Moscow",
    );
    expect(getWatchedZoneIds(state)).toEqual([
      "Europe/Lisbon",
      "Africa/Cairo",
      "Europe/Moscow",
    ]);
  });

  it("should list the device time zone alone for an empty list", () => {
    expect(getWatchedZoneIds(stateWith([], "Africa/Cairo"))).toEqual([
      "Africa/Cairo",
    ]);
  });

  it("should list a device time zone that a location shares once", () => {
    const state = stateWith(
      [createLocation("cairo", "Africa/Cairo")],
      "Africa/Cairo",
    );
    expect(getWatchedZoneIds(state)).toEqual(["Africa/Cairo"]);
  });
});
