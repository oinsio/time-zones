// Verifies FR3, FR9, FR11 of add-interface-language-selection (D4).
import { buildLocaleRegistry } from "./buildLocaleRegistry";
import {
  DEFAULT_LANGUAGE,
  findRegisteredLocale,
  localeRegistry,
  SUPPORTED_LANGUAGES,
} from "./localeRegistry";

const localeFile = (code: string, name: string, extra = {}) => ({
  _meta: {
    code,
    name,
    nativeName: name,
    baseLanguage: code,
    emoji: "🏳️",
  },
  greeting: `hello ${code}`,
  ...extra,
});

const validModules = {
  "./ru.json": localeFile("ru", "Russian"),
  "./de.json": localeFile("de", "German"),
  "./en.json": localeFile("en", "English"),
};

describe("buildLocaleRegistry", () => {
  it("should sort valid locales by name", () => {
    const codes = buildLocaleRegistry(validModules).map(
      ({ metadata }) => metadata.code,
    );
    expect(codes).toEqual(["en", "de", "ru"]);
  });

  it("should keep translations without _meta", () => {
    const [english] = buildLocaleRegistry(validModules);
    expect(english?.translations).toEqual({ greeting: "hello en" });
  });

  it("should skip an invalid file and keep the others", () => {
    const codes = buildLocaleRegistry({
      ...validModules,
      "./fr.json": { _meta: { code: "fr" }, greeting: "x" },
    }).map(({ metadata }) => metadata.code);
    expect(codes).toEqual(["en", "de", "ru"]);
  });

  it("should skip a file whose code differs from its name", () => {
    const registry = buildLocaleRegistry({
      "./it.json": localeFile("fr", "French"),
    });
    expect(registry).toEqual([]);
  });

  it("should skip a path that is not a locale file", () => {
    const registry = buildLocaleRegistry({
      "./nested/en.json": localeFile("en", "English"),
      "./en.txt": localeFile("en", "English"),
    });
    expect(registry).toEqual([]);
  });

  it("should skip a file that is not an object", () => {
    expect(buildLocaleRegistry({ "./en.json": "text" })).toEqual([]);
  });
});

describe("localeRegistry", () => {
  it("should contain the default language", () => {
    expect(findRegisteredLocale(DEFAULT_LANGUAGE)).toBeDefined();
  });

  it("should list its codes as the supported languages", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["en", "ru"]);
    expect(localeRegistry.map(({ metadata }) => metadata.code)).toEqual(
      SUPPORTED_LANGUAGES,
    );
  });

  it("should use the American flag for English", () => {
    expect(findRegisteredLocale("en")?.metadata.emoji).toBe("🇺🇸");
  });

  it("should know the native name of Russian", () => {
    expect(findRegisteredLocale("ru")?.metadata.nativeName).toBe("Русский");
  });

  it("should not find an unregistered code", () => {
    expect(findRegisteredLocale("xx")).toBeUndefined();
  });

  it("should not leak _meta into any translation", () => {
    for (const { translations } of localeRegistry)
      expect(translations).not.toHaveProperty("_meta");
  });
});
