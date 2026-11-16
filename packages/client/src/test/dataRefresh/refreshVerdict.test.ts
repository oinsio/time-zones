// Verifies FR2, FR7, M3 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import type { CityDataComparison } from "../../../scripts/dataRefresh/compareCityData.ts";
import { REFRESH_VERDICTS } from "../../../scripts/dataRefresh/refreshConstants.ts";
import {
  decideCityDataRefresh,
  decideZoneRulesRefresh,
} from "../../../scripts/dataRefresh/refreshVerdict.ts";

const COMMITTED_COUNT = 6000;

function comparison(overrides: Partial<CityDataComparison> & { lacks?: number } = {}): CityDataComparison {
  const lacks = overrides.lacks ?? 0;
  return {
    isSameData: false,
    removedCities: Array.from({ length: lacks }, (_, index) => index + 1),
    removedShare: lacks / COMMITTED_COUNT,
    removedLargeCities: [],
    removedZones: [],
    ...overrides,
  };
}

describe("decideCityDataRefresh", () => {
  it("is UNCHANGED when only the dump date differs", () => {
    expect(decideCityDataRefresh(comparison({ isSameData: true })).verdict).toBe(REFRESH_VERDICTS.UNCHANGED);
  });

  it.each([
    ["lacks 30 cities", { lacks: 30 }, REFRESH_VERDICTS.MERGE],
    ["lacks 60 cities (exactly 1%)", { lacks: 60 }, REFRESH_VERDICTS.MERGE],
    ["lacks 61 cities", { lacks: 61 }, REFRESH_VERDICTS.NEEDS_REVIEW],
    ["lacks a city of 1 200 000", { lacks: 1, removedLargeCities: [77] }, REFRESH_VERDICTS.NEEDS_REVIEW],
    ["no longer uses a zone", { removedZones: ["Asia/Almaty"] }, REFRESH_VERDICTS.NEEDS_REVIEW],
    ["adds 200 cities", { lacks: 0 }, REFRESH_VERDICTS.MERGE],
  ])("%s", (_label, overrides, verdict) => {
    expect(decideCityDataRefresh(comparison(overrides)).verdict).toBe(verdict);
  });

  it("states the count and the share of missing cities", () => {
    expect(decideCityDataRefresh(comparison({ lacks: 61 })).reasons).toEqual([
      "61 committed cities are missing (1.0% of them)",
    ]);
  });

  it("names the missing large city", () => {
    expect(decideCityDataRefresh(comparison({ lacks: 1, removedLargeCities: [77] })).reasons).toEqual([
      "The city with GeoNames ID 77 of at least 1000000 inhabitants is missing",
    ]);
  });

  it("names the zone no city uses any more", () => {
    expect(decideCityDataRefresh(comparison({ removedZones: ["Asia/Almaty"] })).reasons).toEqual([
      "No city uses the zone Asia/Almaty any more",
    ]);
  });

  it("gives one reason per broken rule", () => {
    const decision = decideCityDataRefresh(
      comparison({ lacks: 100, removedLargeCities: [1], removedZones: ["Asia/Almaty"] }),
    );
    expect(decision.reasons).toHaveLength(3);
  });

  it("has no reasons for a merge", () => {
    expect(decideCityDataRefresh(comparison()).reasons).toEqual([]);
  });
});

describe("decideZoneRulesRefresh", () => {
  it("merges a refresh without losses", () => {
    expect(decideZoneRulesRefresh({ removedZoneIds: [], zonesWithoutCoordinates: [] })).toEqual({
      verdict: REFRESH_VERDICTS.MERGE,
      reasons: [],
    });
  });

  it("needs review and names a missing zone identifier", () => {
    expect(decideZoneRulesRefresh({ removedZoneIds: ["Europe/Kyiv"], zonesWithoutCoordinates: [] })).toEqual({
      verdict: REFRESH_VERDICTS.NEEDS_REVIEW,
      reasons: ["The zone identifier Europe/Kyiv of the committed release is missing"],
    });
  });

  it("needs review and names a zone that lost its coordinates", () => {
    expect(decideZoneRulesRefresh({ removedZoneIds: [], zonesWithoutCoordinates: ["Asia/Almaty"] })).toEqual({
      verdict: REFRESH_VERDICTS.NEEDS_REVIEW,
      reasons: ["The coordinates of the zone Asia/Almaty are missing"],
    });
  });
});
