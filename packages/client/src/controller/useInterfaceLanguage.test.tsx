// Verifies FR5, FR7, FR12 of add-interface-language-selection (D3).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import type { PreferencesRepository } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { useInterfaceLanguage } from "./useInterfaceLanguage";
import { usePreferences } from "./usePreferences";

const wrapperFor =
  (repository: PreferencesRepository) =>
  ({ children }: { children: ReactNode }) => (
    <PreferencesProvider
      repository={repository}
      writeScheduler={createManualWriteScheduler()}
    >
      {children}
    </PreferencesProvider>
  );

const renderLanguageHook = (repository: PreferencesRepository) =>
  renderHook(
    () => {
      useInterfaceLanguage();
      return usePreferences();
    },
    { wrapper: wrapperFor(repository) },
  );

describe("useInterfaceLanguage", () => {
  beforeEach(async () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage("ru");
  });

  it("should switch i18next to a chosen language at once", () => {
    const { result } = renderLanguageHook(
      createInMemoryPreferencesRepository(),
    );
    act(() => result.current.setInterfaceLanguage("ru"));
    expect(i18n.language).toBe("ru");
  });

  it("should return to the browser language on Reset", () => {
    const { result } = renderLanguageHook(
      createInMemoryPreferencesRepository(),
    );
    act(() => result.current.setInterfaceLanguage("ru"));
    act(() => result.current.resetPreferences());
    expect(i18n.language).toBe("en");
  });

  it("should apply a change made by another tab", () => {
    const backend = createInMemoryPreferencesBackend();
    const other = createInMemoryPreferencesRepository({ backend });
    renderLanguageHook(createInMemoryPreferencesRepository({ backend }));
    act(() => {
      other.save({ ...DEFAULT_PREFERENCES, interfaceLanguage: "ru" });
    });
    expect(i18n.language).toBe("ru");
  });

  it("should not change the language again when it is already applied", () => {
    const changeLanguage = vi.spyOn(i18n, "changeLanguage");
    const { result } = renderLanguageHook(
      createInMemoryPreferencesRepository(),
    );
    act(() => result.current.setInterfaceLanguage("en"));
    expect(changeLanguage).not.toHaveBeenCalled();
  });

  it("should follow the browser language when none is chosen", () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["ru-RU"]);
    renderLanguageHook(createInMemoryPreferencesRepository());
    expect(i18n.language).toBe("ru");
  });
});
