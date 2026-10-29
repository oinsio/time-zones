// @show-here-entry-for-device-time @FR1, @FR6: when the Here entry exists.
import { describe, expect, it } from "vitest";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { getHereEntry } from "./hereEntry";
import {
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
  type WorldClockState,
} from "./locations";

const city = (cityName: string) =>
  buildLocation({ label: cityName, ...KNOWN_CITIES[cityName] });

const stateOf = (
  cityNames: string[],
  deviceTimeZoneId: string,
  homeCityName?: string,
): WorldClockState => {
  const locations = cityNames.map(city);
  return {
    ...INITIAL_WORLD_CLOCK_STATE,
    locations,
    deviceTimeZoneId,
    homeLocationId: homeCityName ? city(homeCityName).id : null,
  };
};

describe("getHereEntry", () => {
  it.each([
    ["an empty list", [], "Asia/Almaty", undefined, "Asia/Almaty"],
    ["only other zones", ["Moscow"], "Asia/Almaty", undefined, "Asia/Almaty"],
    [
      "Minsk next to Moscow",
      ["Moscow"],
      "Europe/Minsk",
      undefined,
      "Europe/Minsk",
    ],
    [
      "a matching location",
      ["Almaty", "Moscow"],
      "Asia/Almaty",
      undefined,
      undefined,
    ],
    [
      "a matching home location",
      ["Almaty", "Moscow"],
      "Asia/Almaty",
      "Almaty",
      undefined,
    ],
  ])(
    "should give the device zone or nothing for %s",
    (_name, cityNames, deviceTimeZoneId, homeCityName, expectedZone) => {
      const hereEntry = getHereEntry(
        stateOf(cityNames, deviceTimeZoneId, homeCityName),
      );

      expect(hereEntry?.timeZoneId).toBe(expectedZone);
    },
  );

  it("should name UTC after an unknown device zone is reported", () => {
    const outcome = reduceLocations(INITIAL_WORLD_CLOCK_STATE, {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: "Mars/Olympus_Mons",
    });

    expect(outcome.ok && getHereEntry(outcome.state)?.timeZoneId).toBe("UTC");
  });
});
