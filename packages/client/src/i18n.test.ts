// Verifies FR7, FR9, FR10 of add-interface-language-selection: the i18next options
// come from the locale registry; no detector decides the language.
import i18next from "i18next";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/constants";
import { createI18nOptions, resolveStartInterfaceLanguage } from "@/i18n";
import { localeRegistry, type RegisteredLocale } from "@/locales";
import {
  buildRegisteredLocale,
  DIALECT_REGISTRY,
} from "@/test/factories/localeFixtures";

const withTranslations = (
  locale: RegisteredLocale,
  translations: Record<string, unknown>,
): RegisteredLocale => ({ ...locale, translations });

const createInstance = async (
  registry: readonly RegisteredLocale[],
  language: string,
) => {
  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({ ...createI18nOptions(registry), lng: language });
  return i18nInstance;
};

describe("createI18nOptions", () => {
  it("should give i18next translations without _meta", () => {
    const { resources } = createI18nOptions(localeRegistry);
    expect(resources?.en?.translation).not.toHaveProperty("_meta");
  });

  it("should support exactly the registry codes", () => {
    expect(createI18nOptions(DIALECT_REGISTRY).supportedLngs).toEqual([
      "en",
      "ru",
      "ru-KZ",
    ]);
  });

  it("should keep a regional language as it is", () => {
    expect(createI18nOptions(localeRegistry).load).toBe("currentOnly");
  });

  it("should leave HTML escaping to React", () => {
    expect(createI18nOptions(localeRegistry).interpolation?.escapeValue).toBe(
      false,
    );
  });

  it.each([
    { language: "en", expectedTitle: "Time Zones" },
    { language: "ru", expectedTitle: "Часовые пояса" },
  ])(
    "should translate the app title for $language",
    async ({ language, expectedTitle }) => {
      const i18nInstance = await createInstance(localeRegistry, language);
      expect(i18nInstance.t("app.title")).toBe(expectedTitle);
    },
  );

  it("should fall back from a dialect to its base language, then English", async () => {
    const [english, russian, dialect] = DIALECT_REGISTRY as [
      RegisteredLocale,
      RegisteredLocale,
      RegisteredLocale,
    ];
    const registry = [
      withTranslations(english, { a: "en a", b: "en b", c: "en c" }),
      withTranslations(russian, { a: "ru a", b: "ru b" }),
      withTranslations(dialect, { a: "kz a" }),
    ];
    const i18nInstance = await createInstance(registry, "ru-KZ");
    expect([
      i18nInstance.t("a"),
      i18nInstance.t("b"),
      i18nInstance.t("c"),
    ]).toEqual(["kz a", "ru b", "en c"]);
  });

  it("should fall back to English for an unlisted language", async () => {
    const registry = [
      withTranslations(buildRegisteredLocale("en", "English", "English"), {
        a: "en a",
      }),
    ];
    const i18nInstance = await createInstance(registry, "xx");
    expect(i18nInstance.t("a")).toBe("en a");
  });
});

// Verifies FR7, FR8 of add-interface-language-selection (D2, D3).
describe("resolveStartInterfaceLanguage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should start in the language of the stored document", () => {
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        schemaVersion: 2,
        payload: { theme: "DARK", hourFormat: "H12", interfaceLanguage: "ru" },
      }),
    );
    expect(resolveStartInterfaceLanguage()).toBe("ru");
  });

  it("should start in the language of the legacy key", () => {
    localStorage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, "ru");
    expect(resolveStartInterfaceLanguage()).toBe("ru");
  });

  it("should follow the browser without a choice", () => {
    expect(resolveStartInterfaceLanguage()).toBe("en");
  });

  it("should follow the browser when the stored document is unreadable", () => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, "{not json");
    expect(resolveStartInterfaceLanguage()).toBe("en");
  });
});
