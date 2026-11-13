// Verifies FR2 of add-geonames-city-source: English and Russian names.
import { describe, expect, it } from "vitest";
import type { AlternateNameRow } from "../../../scripts/cityData/cityDataTypes.ts";
import { selectCityNames } from "../../../scripts/cityData/selectCityNames.ts";

const CITY = { geonameId: 1, name: "Munich" };

function alternate(
  language: string,
  name: string,
  flags: Partial<AlternateNameRow> = {},
): AlternateNameRow {
  return {
    geonameId: 1,
    language,
    name,
    isPreferred: false,
    isShort: false,
    isColloquial: false,
    isHistoric: false,
    ...flags,
  };
}

describe("selectCityNames", () => {
  it.each([
    ["the main name without alternates", [], "Munich", "Munich"],
    ["the preferred English name", [alternate("en", "Munic", { isPreferred: true })], "Munic", "Munic"],
    ["a non-preferred English name is ignored", [alternate("en", "Munchen")], "Munich", "Munich"],
    ["the preferred Russian name", [alternate("ru", "Мюнхен", { isPreferred: true })], "Munich", "Мюнхен"],
    [
      "the preferred Russian name wins over an earlier one",
      [alternate("ru", "Мюнхн"), alternate("ru", "Мюнхен", { isPreferred: true })],
      "Munich",
      "Мюнхен",
    ],
    ["the first plain Russian name", [alternate("ru", "Мюнхен"), alternate("ru", "Мюнхн")], "Munich", "Мюнхен"],
    [
      "a historic name is skipped",
      [alternate("ru", "Старый", { isHistoric: true }), alternate("ru", "Мюнхен")],
      "Munich",
      "Мюнхен",
    ],
    [
      "a colloquial name is skipped",
      [alternate("ru", "Мюн", { isColloquial: true }), alternate("ru", "Мюнхен")],
      "Munich",
      "Мюнхен",
    ],
    ["only historic names fall back to English", [alternate("ru", "Старый", { isHistoric: true })], "Munich", "Munich"],
    ["no Russian name falls back to English", [alternate("de", "München")], "Munich", "Munich"],
  ])("should use %s", (_, alternates, english, russian) => {
    expect(selectCityNames(CITY, alternates, {})).toEqual({ en: english, ru: russian });
  });

  it("should let an override win over both names", () => {
    const names = selectCityNames(CITY, [alternate("ru", "Мюнхен")], {
      1: { en: "Muenchen", ru: "Мюнхен!" },
    });
    expect(names).toEqual({ en: "Muenchen", ru: "Мюнхен!" });
  });

  it("should let an override replace one language only", () => {
    const names = selectCityNames(CITY, [alternate("ru", "Мюнхен")], { 1: { ru: "М" } });
    expect(names).toEqual({ en: "Munich", ru: "М" });
  });
});
