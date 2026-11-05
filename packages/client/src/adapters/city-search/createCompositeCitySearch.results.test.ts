// Verifies FR5, FR6 of add-locations-via-search (D7).
// Verifies FR8–FR11 of show-zone-abbreviations-and-zone-label-setting (D8).
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

  it("should order abbreviation matches by popularity, then name", () => {
    expect(idsOf("IST").slice(0, 3)).toEqual([
      "Asia/Kolkata",
      "Europe/Dublin",
      "Asia/Jerusalem",
    ]);
  });
});

describe("composite city search by zone abbreviation", () => {
  it("should find New York first for est and EDT", () => {
    expect(idsOf("est")[0]).toBe("America/New_York");
    expect(idsOf("EDT")[0]).toBe("America/New_York");
  });

  it("should include Panama for EST", () => {
    expect(idsOf("EST")).toContain("America/Panama");
  });

  it.each(["ET", "PT", "ALMT", "ICT", "SGT", "GST", "BRT", "ART"])(
    "should give no abbreviation result for %s",
    (query) => {
      const kinds = search
        .search(query, "en")
        .map((result) => result.matchKind);
      expect(kinds).not.toContain(SearchMatchKind.ABBREVIATION);
    },
  );

  it("should give GMT an abbreviation result for London and none for UTC", () => {
    const zoneIds = search
      .search("GMT", "en")
      .filter((result) => result.matchKind === SearchMatchKind.ABBREVIATION)
      .map((result) => result.record.timeZoneId);
    expect(zoneIds).toContain("Europe/London");
    expect(zoneIds).not.toContain("UTC");
  });

  it("should give BST an abbreviation result for London and none for Dhaka", () => {
    const zoneIds = search
      .search("BST", "en")
      .filter((result) => result.matchKind === SearchMatchKind.ABBREVIATION)
      .map((result) => result.record.timeZoneId);
    expect(zoneIds).toContain("Europe/London");
    expect(zoneIds).not.toContain("Asia/Dhaka");
  });

  it("should find nothing for IS by abbreviation", () => {
    const kinds = search.search("IS", "en").map((result) => result.matchKind);
    expect(kinds).not.toContain(SearchMatchKind.ABBREVIATION);
  });
});
