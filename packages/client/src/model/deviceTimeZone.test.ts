// FR1, FR2 of mark-device-time-zone-in-location-list: device zone match.
import { describe, expect, it } from "vitest";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { isLocationInDeviceTimeZone } from "./deviceTimeZone";

describe("isLocationInDeviceTimeZone", () => {
  it.each([
    ["Almaty", "Asia/Almaty", true],
    ["Almaty", "Asia/Tokyo", false],
    ["Minsk", "Europe/Moscow", false],
  ])(
    "should compare %s with device zone %s: %s",
    (city, deviceZone, expected) => {
      const location = buildLocation({ label: city, ...KNOWN_CITIES[city] });
      expect(isLocationInDeviceTimeZone(location, deviceZone)).toBe(expected);
    },
  );
});
