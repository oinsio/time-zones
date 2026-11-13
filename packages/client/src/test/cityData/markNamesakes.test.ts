// Verifies FR7 of add-geonames-city-source (D4): regions for namesakes only.
import { describe, expect, it } from "vitest";
import {
  markNamesakes,
  type NamesakeCandidate,
} from "../../../scripts/cityData/markNamesakes.ts";

function candidate(
  id: string,
  countryCode: string,
  english: string,
  russian: string,
  region?: [string, string],
): NamesakeCandidate {
  return {
    id,
    countryCode,
    names: { en: english, ru: russian },
    region: region ? { en: region[0], ru: region[1] } : undefined,
  };
}

describe("markNamesakes", () => {
  it("should give namesakes of one country their regions", () => {
    const { regions, regionIndexById } = markNamesakes([
      candidate("1", "US", "Springfield", "Спрингфилд", ["Illinois", "Иллинойс"]),
      candidate("2", "US", "Springfield", "Спрингфилд", ["Missouri", "Миссури"]),
    ]);
    expect(regions.map(([english]) => english)).toEqual(["Illinois", "Missouri"]);
    expect(regionIndexById.get("1")).toBe(0);
    expect(regionIndexById.get("2")).toBe(1);
  });

  it("should give no region to the same name in different countries", () => {
    const { regionIndexById } = markNamesakes([
      candidate("1", "CA", "Victoria", "Виктория", ["British Columbia", "Британская Колумбия"]),
      candidate("2", "SC", "Victoria", "Виктория", ["Mahé", "Маэ"]),
    ]);
    expect(regionIndexById.size).toBe(0);
  });

  it("should give no region to a unique name", () => {
    const { regionIndexById } = markNamesakes([
      candidate("1", "RU", "Kazan", "Казань", ["Tatarstan", "Татарстан"]),
    ]);
    expect(regionIndexById.size).toBe(0);
  });

  it("should compare names under the search normalization", () => {
    const { regionIndexById } = markNamesakes([
      candidate("1", "MX", "Léon", "Леон-1", ["A", "А"]),
      candidate("2", "MX", "LEON", "Леон-2", ["B", "Б"]),
    ]);
    expect([...regionIndexById.keys()]).toEqual(["1", "2"]);
  });

  it("should match namesakes by the Russian name alone", () => {
    const { regionIndexById } = markNamesakes([
      candidate("1", "UA", "Alpha", "Заря", ["A", "А"]),
      candidate("2", "UA", "Beta", "Заря", ["B", "Б"]),
    ]);
    expect(regionIndexById.size).toBe(2);
  });

  it("should store one table entry for a region shared by two records", () => {
    const { regions, regionIndexById } = markNamesakes([
      candidate("1", "US", "Salem", "Салем", ["Oregon", "Орегон"]),
      candidate("2", "US", "Salem", "Салем", ["Oregon", "Орегон"]),
    ]);
    expect(regions).toEqual([["Oregon", "Орегон"]]);
    expect(regionIndexById.get("2")).toBe(0);
  });

  it("should index regions in sorted order whatever the input order", () => {
    const { regions } = markNamesakes([
      candidate("1", "US", "A", "А", ["Zeta", "Зета"]),
      candidate("2", "US", "A", "А", ["Alpha", "Альфа"]),
    ]);
    expect(regions).toEqual([["Alpha", "Альфа"], ["Zeta", "Зета"]]);
  });

  it("should throw naming the city when a namesake has no region", () => {
    expect(() =>
      markNamesakes([
        candidate("1", "US", "Salem", "Салем", ["Oregon", "Орегон"]),
        candidate("2", "US", "Salem", "Салем"),
      ]),
    ).toThrow(/Salem/);
  });
});
