// Verifies FR5, FR6 of add-locations-via-search (D7).
import { describe, expect, it } from "vitest";
import { MAX_SEARCH_RESULTS, POPULAR_TIME_ZONE_IDS } from "@/constants";
import { SearchMatchKind } from "@/ports";
import { city, idsOf, search } from "./compositeCityFixtures";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

describe("composite city search result set", () => {
  it("should list each zone once, at its best match kind", () => {
    const ids = idsOf("ist");
    expect(new Set(ids).size).toBe(ids.length);
    const utcResults = search.search("utc", "en");
    expect(utcResults).toHaveLength(1);
    expect(utcResults[0]?.matchKind).toBe(SearchMatchKind.ABBREVIATION);
  });

  it("should cap a single-letter query over many zones at the limit", () => {
    const realZones = Intl.supportedValuesOf("timeZone").map((timeZoneId) =>
      city(timeZoneId, `Aaa ${timeZoneId}`, "Город"),
    );
    const bigSearch = createCompositeCitySearch(realZones);
    expect(bigSearch.search("a", "en")).toHaveLength(MAX_SEARCH_RESULTS);
  });
});

describe("composite city search suggestions", () => {
  it("should suggest the popular zones in popular order", () => {
    expect(search.suggest().map((result) => result.record.timeZoneId)).toEqual(
      POPULAR_TIME_ZONE_IDS,
    );
  });

  it("should mark suggestions as suggestions", () => {
    expect(search.suggest().map((result) => result.matchKind)).toEqual(
      search.suggest().map(() => SearchMatchKind.SUGGESTION),
    );
  });
});

describe("composite city search popularity", () => {
  it("should list a popular city before an unpopular one that sorts earlier by name", () => {
    const popularitySearch = createCompositeCitySearch([
      city("Asia/Tbilisi", "Tbilisi", "Тбилиси", "GE"),
      city("Asia/Tokyo", "Tokyo", "Токио", "JP"),
    ]);
    const matchedIds = popularitySearch
      .search("t", "en")
      .map((result) => result.record.timeZoneId);
    expect(
      matchedIds.filter((id) => id === "Asia/Tokyo" || id === "Asia/Tbilisi"),
    ).toEqual(["Asia/Tokyo", "Asia/Tbilisi"]);
  });

  it("should keep the abbreviation table order for abbreviation matches", () => {
    expect(idsOf("IST").slice(0, 3)).toEqual([
      "Asia/Kolkata",
      "Asia/Jerusalem",
      "Europe/Dublin",
    ]);
  });
});
