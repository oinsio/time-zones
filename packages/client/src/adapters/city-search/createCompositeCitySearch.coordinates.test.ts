// Verifies FR8, NFR-P2 of add-city-coordinates-to-locations (D7): the coordinates of a stored location.
import { describe, expect, it } from "vitest";
import { startWorkCount } from "@/test/workCounters";
import type { GeoNamesCityData, ZoneCityData } from "./citySource";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

const MOSCOW_COORDINATES = { latitude: 55.8, longitude: 37.6 };
const KAZAN_COORDINATES = { latitude: 55.8, longitude: 49.1 };
const zoneCities: ZoneCityData[] = [
  {
    timeZoneId: "Europe/Moscow",
    names: { en: "Moscow", ru: "Москва" },
    countryCode: "RU",
    coordinates: MOSCOW_COORDINATES,
  },
  {
    timeZoneId: "UTC",
    names: { en: "UTC", ru: "UTC" },
    countryCode: "",
  },
];
const cityData: GeoNamesCityData = {
  cities: [
    {
      id: "551487",
      names: { en: "Kazan", ru: "Казань" },
      countryCode: "RU",
      timeZoneId: "Europe/Moscow",
      population: 1_243_500,
      coordinates: KAZAN_COORDINATES,
    },
  ],
  zoneCityPopulations: {},
  zoneCityRegions: {},
};
const search = createCompositeCitySearch(zoneCities, cityData);

describe("composite city search coordinates", () => {
  it.each([
    [
      "a GeoNames city by its English name",
      "Europe/Moscow",
      "Kazan",
      KAZAN_COORDINATES,
    ],
    [
      "a GeoNames city by its Russian name",
      "Europe/Moscow",
      "Казань",
      KAZAN_COORDINATES,
    ],
    ["a zone city", "Europe/Moscow", "Moscow", MOSCOW_COORDINATES],
    [
      "a label no record names, from the zone city",
      "Europe/Moscow",
      "Old Town",
      MOSCOW_COORDINATES,
    ],
    ["UTC, which has none", "UTC", "UTC", undefined],
    ["a zone the data does not know", "Asia/Nowhere", "Nowhere", undefined],
  ])("should answer for %s", (_, timeZoneId, storedLabel, expected) => {
    expect(search.getCoordinates(timeZoneId, storedLabel)).toEqual(expected);
  });

  it("should normalize no text", () => {
    const workCount = startWorkCount();
    search.getCoordinates("Europe/Moscow", "Kazan");
    search.getCoordinates("Europe/Moscow", "Old Town");
    search.getCoordinates("UTC", "UTC");
    workCount.stop();
    expect(workCount.normalizations()).toBe(0);
  });
});
