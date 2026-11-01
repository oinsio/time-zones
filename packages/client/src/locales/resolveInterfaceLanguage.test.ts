// Verifies FR7 of add-interface-language-selection (D3).
import { DIALECT_REGISTRY } from "@/test/factories/localeFixtures";
import { resolveInterfaceLanguage } from "./resolveInterfaceLanguage";

const resolve = (chosen: string | null, browser: readonly string[]) =>
  resolveInterfaceLanguage(chosen, browser, DIALECT_REGISTRY);

describe("resolveInterfaceLanguage", () => {
  it.each([
    ["ru", ["en-US"], "ru"],
    ["xx", ["ru-RU"], "ru"],
    [null, ["ru-RU"], "ru"],
    [null, ["de-DE", "ru"], "ru"],
    [null, ["en-US"], "en"],
    [null, ["de-DE"], "en"],
    [null, [], "en"],
    [null, ["ru-KZ"], "ru-KZ"],
    [null, ["ru-kz"], "ru-KZ"],
    [null, ["ru_RU"], "en"],
    [null, ["ru_RU", "ru"], "ru"],
  ])(
    "should resolve chosen %s with browser %j to %s",
    (chosen, browser, expected) => {
      expect(resolve(chosen, browser)).toBe(expected);
    },
  );

  it("should not pick a dialect by its base language", () => {
    expect(resolve(null, ["ru"])).toBe("ru");
  });

  it("should not pick a dialect by its primary subtag", () => {
    const registry = DIALECT_REGISTRY.filter(
      ({ metadata }) => metadata.code !== "ru",
    );
    expect(resolveInterfaceLanguage(null, ["ru"], registry)).toBe("en");
  });

  it("should read the real registry by default", () => {
    expect(resolveInterfaceLanguage("ru", [])).toBe("ru");
  });
});
