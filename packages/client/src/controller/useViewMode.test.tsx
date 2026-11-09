// Verifies FR3, FR4 of add-view-mode-setting-and-grid-skeleton (D1).
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";
import { useViewMode } from "./useViewMode";

type Repository = ReturnType<typeof createInMemoryPreferencesRepository>;

const renderViewMode = (repository: Repository) => {
  const writeScheduler = createManualWriteScheduler();
  const view = renderHook(
    () => ({ viewMode: useViewMode(), preferences: usePreferences() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={repository}
          writeScheduler={writeScheduler}
        >
          {children}
        </PreferencesProvider>
      ),
    },
  );
  return { ...view, writeScheduler };
};

describe("useViewMode", () => {
  it("should be none chosen outside a provider", () => {
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBeNull();
  });

  it("should return the stored view", () => {
    const { result } = renderViewMode(
      createInMemoryPreferencesRepository({
        initialDocument: {
          status: PreferencesLoadStatus.LOADED,
          preferences: { ...DEFAULT_PREFERENCES, viewMode: "grid" },
        },
      }),
    );
    expect(result.current.viewMode).toBe("grid");
  });

  it("should apply a chosen view at once and write it after the debounce", () => {
    const repository = createInMemoryPreferencesRepository();
    const { result, writeScheduler } = renderViewMode(repository);
    act(() => result.current.preferences.setViewMode("grid"));
    expect(result.current.viewMode).toBe("grid");
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
    act(() => writeScheduler.runPending());
    expect(repository.load()).toMatchObject({
      preferences: { viewMode: "grid" },
    });
  });

  it("should apply a view chosen in another tab", () => {
    const backend = createInMemoryPreferencesBackend();
    const { result } = renderViewMode(
      createInMemoryPreferencesRepository({ backend }),
    );
    act(() => {
      createInMemoryPreferencesRepository({ backend }).save({
        ...DEFAULT_PREFERENCES,
        viewMode: "grid",
      });
    });
    expect(result.current.viewMode).toBe("grid");
  });
});
