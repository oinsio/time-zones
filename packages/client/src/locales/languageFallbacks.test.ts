// Verifies FR10 of add-interface-language-selection (D5).
import { FIRST_DAY_OF_WEEK_BY_LANGUAGE } from "@/constants";
import { DIALECT_REGISTRY } from "@/test/factories/localeFixtures";
import {
  pickByLanguageFallback,
  resolveCityNameLanguage,
  resolveLanguageFallbacks,
} from "./languageFallbacks";

describe("resolveLanguageFallbacks", () => {
  it.each([
    ["ru-KZ", ["ru-KZ", "ru", "en"]],
    ["ru", ["ru", "en"]],
    ["en", ["en"]],
    ["xx", ["en"]],
  ])("should order %s as %j", (code, expectedOrder) => {
    expect(resolveLanguageFallbacks(code, DIALECT_REGISTRY)).toEqual(
      expectedOrder,
    );
  });

  it("should read the real registry by default", () => {
    expect(resolveLanguageFallbacks("ru")).toEqual(["ru", "en"]);
  });
});

describe("pickByLanguageFallback", () => {
  it("should pick the first defined value along the order", () => {
    expect(
      pickByLanguageFallback("ru-KZ", { en: 7, ru: 1 }, DIALECT_REGISTRY),
    ).toBe(1);
  });

  it("should pick the own value of a dialect first", () => {
    expect(
      pickByLanguageFallback("ru-KZ", { "ru-KZ": 6, ru: 1 }, DIALECT_REGISTRY),
    ).toBe(6);
  });

  it("should give Monday to a Russian dialect", () => {
    expect(
      pickByLanguageFallback(
        "ru-KZ",
        FIRST_DAY_OF_WEEK_BY_LANGUAGE,
        DIALECT_REGISTRY,
      ),
    ).toBe(1);
  });

  it("should fall back to English for a code missing from the real registry", () => {
    expect(pickByLanguageFallback("ru-KZ", FIRST_DAY_OF_WEEK_BY_LANGUAGE)).toBe(
      7,
    );
  });

  it("should return undefined when no language has a value", () => {
    expect(pickByLanguageFallback("ru", {}, DIALECT_REGISTRY)).toBeUndefined();
  });
});

describe("resolveCityNameLanguage", () => {
  it.each([
    ["ru-KZ", "ru"],
    ["ru", "ru"],
    ["en", "en"],
    ["de", "en"],
  ])("should map %s to the city name language %s", (code, expected) => {
    expect(resolveCityNameLanguage(code, DIALECT_REGISTRY)).toBe(expected);
  });
});
