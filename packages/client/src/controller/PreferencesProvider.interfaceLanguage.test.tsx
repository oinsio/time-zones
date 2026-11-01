// Verifies FR7 of add-interface-language-selection (D1).
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";

const renderPreferences = () => {
  const repository = createInMemoryPreferencesRepository();
  const writeScheduler = createManualWriteScheduler();
  const view = renderHook(() => usePreferences(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <PreferencesProvider
        repository={repository}
        writeScheduler={writeScheduler}
      >
        {children}
      </PreferencesProvider>
    ),
  });
  return { ...view, repository, writeScheduler };
};

describe("PreferencesProvider interface language", () => {
  it("should apply the interface language at once and write it once after the debounce", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    const saveSpy = vi.spyOn(repository, "save");
    act(() => result.current.setInterfaceLanguage("ru"));
    expect(result.current.preferences.interfaceLanguage).toBe("ru");
    expect(saveSpy).not.toHaveBeenCalled();
    act(() => writeScheduler.runPending());
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(repository.load()).toMatchObject({
      preferences: { interfaceLanguage: "ru" },
    });
  });
});
