// Verifies FR6 of add-interface-language-selection.
import { TEN_LOCALES } from "@/test/factories/localeFixtures";
import { filterLocales } from "./filterLocales";

const codesFor = (query: string) =>
  filterLocales(TEN_LOCALES, query).map(({ metadata }) => metadata.code);

describe("filterLocales", () => {
  it.each([
    ["deu", ["de"]],
    ["GERMAN", ["de"]],
    [" ru ", ["ru"]],
    ["рус", ["ru"]],
    ["francais", ["fr"]],
    ["zzz", []],
  ])("should find %j as %j", (query, expectedCodes) => {
    expect(codesFor(query)).toEqual(expectedCodes);
  });

  it("should keep every locale in registry order for an empty query", () => {
    expect(codesFor("")).toEqual(
      TEN_LOCALES.map(({ metadata }) => metadata.code),
    );
  });

  it("should keep every locale for a blank query", () => {
    expect(codesFor("   ")).toHaveLength(TEN_LOCALES.length);
  });
});
