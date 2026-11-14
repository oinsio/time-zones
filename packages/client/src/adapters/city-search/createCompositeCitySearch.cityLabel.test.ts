// Verifies FR9 of add-geonames-city-source (D7): city labels of GeoNames cities.
import { describe, expect, it } from "vitest";
import { startWorkCount } from "@/test/workCounters";
import {
  cityData,
  fullSearch,
  geoNamesCity,
  zoneCities,
} from "./compositeGeoNamesFixtures";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

describe("composite city search city labels", () => {
  it.each([
    ["en", "Казань", "Kazan"],
    ["ru", "Kazan", "Казань"],
  ] as const)(
    "should show a GeoNames city in %s",
    (language, storedLabel, expected) => {
      expect(
        fullSearch.getCityLabel("Europe/Moscow", storedLabel, language),
      ).toBe(expected);
    },
  );

  it("should still show the zone city in the language of the zone", () => {
    expect(fullSearch.getCityLabel("Europe/Moscow", "Москва", "en")).toBe(
      "Moscow",
    );
  });

  it("should show namesakes of one zone with the same label", () => {
    expect(fullSearch.getCityLabel("America/Chicago", "Спрингфилд", "en")).toBe(
      "Springfield",
    );
    expect(
      fullSearch.getCityLabel("America/Chicago", "Springfield", "ru"),
    ).toBe("Спрингфилд");
  });

  it("should prefer the zone city over a GeoNames city with the same name", () => {
    const search = createCompositeCitySearch(zoneCities, {
      ...cityData,
      cities: [
        geoNamesCity(
          "99",
          "Chicago",
          "Чикаго-Сити",
          "US",
          "America/Chicago",
          5_000_000,
        ),
      ],
    });
    expect(search.getCityLabel("America/Chicago", "Chicago", "ru")).toBe(
      "Чикаго",
    );
  });

  it("should return the stored label for an unknown label", () => {
    expect(fullSearch.getCityLabel("Europe/Moscow", "Nowhere", "ru")).toBe(
      "Nowhere",
    );
  });

  it("should return the stored label for a zone without records", () => {
    expect(fullSearch.getCityLabel("Mars/Olympus_Mons", "Base", "ru")).toBe(
      "Base",
    );
  });

  it("should not normalize text when asked for a label", () => {
    const workCount = startWorkCount();
    try {
      fullSearch.getCityLabel("Europe/Moscow", "Kazan", "ru");
      expect(workCount.normalizations()).toBe(0);
    } finally {
      workCount.stop();
    }
  });
});
