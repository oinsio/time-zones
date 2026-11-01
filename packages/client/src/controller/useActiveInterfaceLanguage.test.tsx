// Verifies FR5, FR10 of add-interface-language-selection (D3).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";

describe("useActiveInterfaceLanguage", () => {
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should report the language i18next applied", async () => {
    await i18n.changeLanguage("en");
    const { result } = renderHook(() => useActiveInterfaceLanguage());
    expect(result.current.code).toBe("en");
    expect(result.current.locale?.metadata.nativeName).toBe("English");
    expect(result.current.cityNameLanguage).toBe("en");
  });

  it("should follow a change of language", async () => {
    await i18n.changeLanguage("en");
    const { result } = renderHook(() => useActiveInterfaceLanguage());
    await act(() => i18n.changeLanguage("ru"));
    expect(result.current.code).toBe("ru");
    expect(result.current.locale?.metadata.nativeName).toBe("Русский");
    expect(result.current.cityNameLanguage).toBe("ru");
  });
});
