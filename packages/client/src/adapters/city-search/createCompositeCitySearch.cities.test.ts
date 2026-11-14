// Verifies FR3, FR4, FR5, FR6 of add-geonames-city-source (D7): results per city and their order.
import { describe, expect, it } from "vitest";
import { MAX_SEARCH_RESULTS } from "@/constants";
import { SearchMatchKind } from "@/ports";
import {
  cityData,
  fullSearch,
  geoNamesCity,
  resultIds,
  zoneCities,
} from "./compositeGeoNamesFixtures";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

describe("composite city search with GeoNames cities", () => {
  it("should find a city that is not a zone city by name in both languages", () => {
    expect(resultIds("kazan")).toEqual(["551487"]);
    expect(resultIds("казан", "ru")).toEqual(["551487"]);
  });

  it("should give each city its own result, a zone appearing once per city", () => {
    const results = fullSearch.search("springfield", "en");
    expect(results.map((result) => result.record.timeZoneId)).toEqual([
      "America/Chicago",
      "America/Chicago",
    ]);
    expect(new Set(results.map((result) => result.record.id)).size).toBe(2);
  });

  it("should keep the abbreviation kind of a zone city that also matches by name", () => {
    const [first] = fullSearch.search("msk", "en");
    expect(first?.record.id).toBe("Europe/Moscow");
    expect(first?.matchKind).toBe(SearchMatchKind.ABBREVIATION);
  });

  it("should not find GeoNames cities by an abbreviation", () => {
    expect(resultIds("msk")).toEqual(["Europe/Moscow"]);
    expect(
      fullSearch
        .search("msk", "en")
        .every((result) => result.record.id === result.record.timeZoneId),
    ).toBe(true);
  });

  it("should search zone cities alone when no city data is given", () => {
    expect(
      createCompositeCitySearch(zoneCities)
        .search("kazan", "en")
        .map((result) => result.record.id),
    ).toEqual([]);
  });

  it("should cap country results at the limit", () => {
    const manyCities = Array.from(
      { length: MAX_SEARCH_RESULTS + 5 },
      (_, index) =>
        geoNamesCity(
          String(1000 + index),
          `Town ${index}`,
          `Город ${index}`,
          "RU",
          "Europe/Moscow",
          index,
        ),
    );
    const search = createCompositeCitySearch(zoneCities, {
      ...cityData,
      cities: manyCities,
    });
    expect(search.search("russia", "en")).toHaveLength(MAX_SEARCH_RESULTS);
  });
});

describe("composite city search order", () => {
  it.each([
    [
      "popular locations before larger cities",
      "new",
      ["America/New_York", "5101798"],
    ],
    ["larger cities first", "spring", ["4409896", "4250542"]],
    ["equal population falls back to the name", "na", ["11", "12"]],
    [
      "zone cities first among country matches",
      "russia",
      ["Europe/Moscow", "Asia/Yekaterinburg", "551487"],
    ],
  ])("should rank: %s", (_label, query, expectedIds) => {
    expect(resultIds(query)).toEqual(expectedIds);
  });

  it("should rank a name match before a country match whatever the population", () => {
    expect(resultIds("us")[0]).not.toBe("Europe/Moscow");
  });
});
