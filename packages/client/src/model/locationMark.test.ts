// Verifies FR1, FR4 of match-here-mark-to-design: the kind of a row's mark.
import { describe, expect, it } from "vitest";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { getLocationMarkKind, LocationMarkKind } from "./locationMark";

describe("getLocationMarkKind", () => {
  it.each([
    ["Almaty", "Asia/Almaty", LocationMarkKind.HERE],
    ["Almaty", "Asia/Tokyo", undefined],
    ["Minsk", "Europe/Moscow", undefined],
  ])(
    "should give the kind of %s with device zone %s: %s",
    (cityName, deviceTimeZoneId, expectedKind) => {
      const location = buildLocation({
        label: cityName,
        ...KNOWN_CITIES[cityName],
      });

      expect(getLocationMarkKind(location, deviceTimeZoneId)).toBe(
        expectedKind,
      );
    },
  );
});
