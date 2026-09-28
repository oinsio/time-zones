// Verifies FR2 of setup-app-shell-and-pages-deploy: document title and
// <html lang> follow the active UI language.
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import { useDocumentLanguage } from "./useDocumentLanguage";

const ENGLISH_TITLE = "Time Zones";
const RUSSIAN_TITLE = "Часовые пояса";

describe("useDocumentLanguage", () => {
  beforeEach(async () => {
    document.title = "";
    document.documentElement.lang = "";
    await i18n.changeLanguage("ru");
  });

  it.each([
    { language: "en", expectedTitle: ENGLISH_TITLE },
    { language: "ru", expectedTitle: RUSSIAN_TITLE },
  ])(
    "should set document title to $expectedTitle when language is $language",
    async ({ language, expectedTitle }) => {
      await i18n.changeLanguage(language);
      renderHook(() => useDocumentLanguage());
      expect(document.title).toBe(expectedTitle);
    },
  );

  it.each(["en", "ru"])(
    "should set html lang to %s when it is the active language",
    async (language) => {
      await i18n.changeLanguage(language);
      renderHook(() => useDocumentLanguage());
      expect(document.documentElement.lang).toBe(language);
    },
  );

  it("should resolve a regional language code to its base language", async () => {
    await i18n.changeLanguage("ru-RU");
    renderHook(() => useDocumentLanguage());
    expect(document.documentElement.lang).toBe("ru");
  });

  it("should update title when language changes after mount", async () => {
    renderHook(() => useDocumentLanguage());
    await act(async () => {
      await i18n.changeLanguage("en");
    });
    expect(document.title).toBe(ENGLISH_TITLE);
  });

  it("should update html lang when language changes after mount", async () => {
    renderHook(() => useDocumentLanguage());
    await act(async () => {
      await i18n.changeLanguage("en");
    });
    expect(document.documentElement.lang).toBe("en");
  });
});
