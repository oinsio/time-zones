// Verifies FR1, FR4 of match-here-mark-to-design: the kind of a row's mark.
// Verifies FR7 of set-home-location-and-show-differences (D3): the home mark.
import { describe, expect, it } from "vitest";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { getLocationMarkKind, LocationMarkKind } from "./locationMark";

describe("getLocationMarkKind", () => {
  it.each([
    ["Almaty", "Asia/Almaty", null, LocationMarkKind.HERE],
    ["Almaty", "Asia/Tokyo", null, undefined],
    ["Minsk", "Europe/Moscow", null, undefined],
    ["Almaty", "Asia/Tokyo", "Asia/Almaty|Almaty", LocationMarkKind.HOME],
    ["Almaty", "Asia/Almaty", "Asia/Almaty|Almaty", LocationMarkKind.HOME],
    ["Almaty", "Asia/Almaty", "Asia/Tokyo|Tokyo", LocationMarkKind.HERE],
    ["Almaty", "Asia/Tokyo", "Asia/Tokyo|Tokyo", undefined],
  ])(
    "should give the kind of %s with device zone %s and home %s: %s",
    (cityName, deviceTimeZoneId, homeLocationId, expectedKind) => {
      const location = buildLocation({
        label: cityName,
        ...KNOWN_CITIES[cityName],
      });

      expect(
        getLocationMarkKind(location, deviceTimeZoneId, homeLocationId),
      ).toBe(expectedKind);
    },
  );
});
