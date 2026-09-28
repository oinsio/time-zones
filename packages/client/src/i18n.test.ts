// Verifies FR2 of setup-app-shell-and-pages-deploy: production i18next options
// detect, resolve and remember the UI language.
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nInitOptions, LANGUAGE_STORAGE_KEY } from "@/i18n";

const createDetectedInstance = async (browserLanguages: string[]) => {
  const [primaryBrowserLanguage] = browserLanguages;
  vi.spyOn(navigator, "languages", "get").mockReturnValue(browserLanguages);
  vi.spyOn(navigator, "language", "get").mockReturnValue(
    primaryBrowserLanguage,
  );
  const i18nInstance = i18next.createInstance().use(LanguageDetector);
  await i18nInstance.init(i18nInitOptions);
  return i18nInstance;
};

describe("i18nInitOptions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should resolve a regional browser language to its base language", async () => {
    const i18nInstance = await createDetectedInstance(["ru-RU"]);
    expect(i18nInstance.resolvedLanguage).toBe("ru");
  });

  it("should fall back to English for an unsupported browser language", async () => {
    const i18nInstance = await createDetectedInstance(["de-DE"]);
    expect(i18nInstance.resolvedLanguage).toBe("en");
  });

  it("should prefer the stored language over the browser language", async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "ru");
    const i18nInstance = await createDetectedInstance(["en-US"]);
    expect(i18nInstance.resolvedLanguage).toBe("ru");
  });

  it("should store the chosen language under the language key", async () => {
    const i18nInstance = await createDetectedInstance(["en-US"]);
    await i18nInstance.changeLanguage("ru");
    expect(localStorage.getItem("language")).toBe("ru");
  });

  it.each([
    { language: "en", expectedTitle: "Time Zones" },
    { language: "ru", expectedTitle: "Часовые пояса" },
  ])(
    "should translate the app title for $language",
    async ({ language, expectedTitle }) => {
      const i18nInstance = await createDetectedInstance([language]);
      expect(i18nInstance.t("app.title")).toBe(expectedTitle);
    },
  );

  it("should leave HTML escaping to React", () => {
    expect(i18nInitOptions.interpolation?.escapeValue).toBe(false);
  });
});
