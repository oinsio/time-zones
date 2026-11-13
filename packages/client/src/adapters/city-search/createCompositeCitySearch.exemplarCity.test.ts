// Verifies FR8, FR12 of show-here-entry-for-device-time: exemplar city.
// Verifies FR1 of show-city-labels-in-interface-language: city label.
import zoneCities from "virtual:zone-cities";
import { describe, expect, it } from "vitest";
import { describeCitySearchContract } from "./citySearch.contract";
import {
  cityData,
  zoneCities as fixtureZoneCities,
} from "./compositeGeoNamesFixtures";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

describeCitySearchContract("createCompositeCitySearch", {
  createSearch: () => createCompositeCitySearch(zoneCities),
  namedZones: [
    { timeZoneId: "Asia/Almaty", language: "en", cityName: "Almaty" },
    { timeZoneId: "Asia/Almaty", language: "ru", cityName: "Алматы" },
    // The canonical ID of the renamed zone (CLDR 48)
    { timeZoneId: "Europe/Kyiv", language: "en", cityName: "Kyiv" },
  ],
  derivedZone: { timeZoneId: "Mars/Olympus_Mons", cityName: "Olympus Mons" },
  cityLabels: [
    {
      timeZoneId: "Asia/Tokyo",
      storedLabel: "Токио",
      language: "en",
      cityLabel: "Tokyo",
    },
    {
      timeZoneId: "Asia/Tokyo",
      storedLabel: "Tokyo",
      language: "ru",
      cityLabel: "Токио",
    },
    {
      timeZoneId: "Asia/Tokyo",
      storedLabel: "Edo",
      language: "en",
      cityLabel: "Edo",
    },
    {
      timeZoneId: "Mars/Olympus_Mons",
      storedLabel: "Base",
      language: "ru",
      cityLabel: "Base",
    },
  ],
});

// Verifies FR10 of add-geonames-city-source: GeoNames cities do not change the exemplar city.
describe("exemplar city with GeoNames cities", () => {
  const search = createCompositeCitySearch(fixtureZoneCities, cityData);

  it.each([
    ["en", "Moscow"],
    ["ru", "Москва"],
  ] as const)("should stay the zone city in %s", (language, expected) => {
    expect(search.getExemplarCity("Europe/Moscow", language)).toBe(expected);
  });

  it("should offer the same suggestions", () => {
    const withoutCities = createCompositeCitySearch(fixtureZoneCities);
    expect(search.suggest().map((result) => result.record.id)).toEqual(
      withoutCities.suggest().map((result) => result.record.id),
    );
  });
});
