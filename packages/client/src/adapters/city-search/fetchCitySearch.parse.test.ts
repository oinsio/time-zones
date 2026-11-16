// Verifies FR15, FR16, NFR-P2 of add-locations-via-search (D8); FR14 of add-geonames-city-source (D5).
// Verifies FR5 of add-city-coordinates-to-locations (D2, D5): coordinates are decoded from tenths.
import { describe, expect, it } from "vitest";
import { parseCitySearchData } from "./fetchCitySearch";
import {
  parse,
  validCityData,
  validRecord,
} from "./fetchCitySearch.parse.fixtures";

describe("parse city search data", () => {
  it("should accept valid zone cities and city data", () => {
    expect(parse().zoneCities).toEqual([{ ...validRecord }]);
  });

  it("should expand a city tuple with names, zone and no region", () => {
    expect(parse().cityData.cities[0]).toEqual({
      id: "551487",
      names: { en: "Kazan", ru: "Казань" },
      countryCode: "RU",
      timeZoneId: "Europe/Moscow",
      population: 1243500,
      coordinates: { latitude: 55.8, longitude: 49.1 },
    });
  });

  // @add-city-coordinates-to-locations @FR5
  it("should decode negative tenths of a southern and western city", () => {
    expect(parse().cityData.cities[1]?.coordinates).toEqual({
      latitude: -0.2,
      longitude: -78.5,
    });
  });

  it.each([
    [
      "tenths",
      { latitudeTenths: 558, longitudeTenths: 376 },
      { latitude: 55.8, longitude: 37.6 },
    ],
    ["no tenths", {}, undefined],
  ])(
    "should decode the zone city coordinates from %s",
    (_label, tenths, coordinates) => {
      const parsed = parseCitySearchData({
        zoneCities: [{ ...validRecord, ...tenths }],
        cityData: validCityData,
      });
      expect(parsed.zoneCities[0]?.coordinates).toEqual(coordinates);
    },
  );

  it.each([
    ["a latitude without a longitude", { latitudeTenths: 1 }],
    ["a longitude without a latitude", { longitudeTenths: 1 }],
    ["a latitude of 91 degrees", { latitudeTenths: 910, longitudeTenths: 0 }],
    ["text tenths", { latitudeTenths: "1", longitudeTenths: 0 }],
  ])(
    "should read a zone city with %s as one without coordinates",
    (_label, tenths) => {
      const parsed = parseCitySearchData({
        zoneCities: [{ ...validRecord, ...tenths }],
        cityData: validCityData,
      });
      expect(parsed.zoneCities[0]?.coordinates).toBeUndefined();
      expect(parsed.zoneCities[0]?.timeZoneId).toBe("Europe/Moscow");
    },
  );

  it("should expand a Russian name of 0 to the English name and a region index to its names", () => {
    expect(parse().cityData.cities[1]).toMatchObject({
      id: "4250542",
      names: { en: "Springfield", ru: "Springfield" },
      region: { en: "Illinois", ru: "Иллинойс" },
    });
  });
});
