// Verifies FR4, FR5, FR7 of add-settings-page-and-device-time-location.
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { PREFERENCES_WRITE_DEBOUNCE_MS } from "@/constants";
import { PreferencesLoadStatus } from "@/ports";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  ThemePreference,
} from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { PreferencesStatus, usePreferences } from "./usePreferences";

const storedDarkTwelveHour = {
  status: PreferencesLoadStatus.LOADED,
  preferences: { theme: ThemePreference.DARK, hourFormat: HourFormat.H12 },
} as const;

function renderPreferences(
  repository = createInMemoryPreferencesRepository(),
  writeScheduler = createManualWriteScheduler(),
) {
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
}

describe("PreferencesProvider", () => {
  it("should apply the defaults without a document and save nothing", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    writeScheduler.runPending();
    expect(result.current.preferences).toEqual(DEFAULT_PREFERENCES);
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });

  it("should apply a stored document", () => {
    const { result } = renderPreferences(
      createInMemoryPreferencesRepository({
        initialDocument: storedDarkTwelveHour,
      }),
    );
    expect(result.current.preferences).toEqual(
      storedDarkTwelveHour.preferences,
    );
  });

  it("should apply a change at once and write it after the debounce delay", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    act(() => result.current.setHourFormat(HourFormat.H12));
    expect(result.current.preferences.hourFormat).toBe(HourFormat.H12);
    expect(repository.load().status).toBe(PreferencesLoadStatus.EMPTY);
    expect(writeScheduler.lastDelayMs()).toBe(PREFERENCES_WRITE_DEBOUNCE_MS);
    act(() => writeScheduler.runPending());
    expect(repository.load()).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences: { ...DEFAULT_PREFERENCES, hourFormat: HourFormat.H12 },
    });
  });

  it("should save two quick changes once, with both applied", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    const saveSpy = vi.spyOn(repository, "save");
    act(() => result.current.setTheme(ThemePreference.DARK));
    act(() => result.current.setHourFormat(HourFormat.H12));
    act(() => writeScheduler.runPending());
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(storedDarkTwelveHour.preferences);
  });

  it("should not schedule a write for an unchanged value", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    act(() => result.current.setTheme(ThemePreference.SYSTEM));
    act(() => writeScheduler.runPending());
    expect(repository.load().status).toBe(PreferencesLoadStatus.EMPTY);
  });

  it("should flush a pending write on pagehide", () => {
    const { result, repository } = renderPreferences();
    act(() => result.current.setTheme(ThemePreference.LIGHT));
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(repository.load().status).toBe(PreferencesLoadStatus.LOADED);
  });

  it("should write nothing on pagehide without a pending change", () => {
    const { repository } = renderPreferences();
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(repository.load().status).toBe(PreferencesLoadStatus.EMPTY);
  });

  it("should apply a change made by another tab", () => {
    const { first, second } = createSharedPair();
    const { result } = renderPreferences(first);
    act(() => {
      second.save(storedDarkTwelveHour.preferences);
    });
    expect(result.current.preferences).toEqual(
      storedDarkTwelveHour.preferences,
    );
  });

  it("should use the defaults and report UNREADABLE for an unreadable document", () => {
    const { result } = renderPreferences(
      createInMemoryPreferencesRepository({
        initialDocument: { status: PreferencesLoadStatus.UNREADABLE },
      }),
    );
    expect(result.current.loadStatus).toBe(PreferencesStatus.UNREADABLE);
    expect(result.current.preferences).toEqual(DEFAULT_PREFERENCES);
  });

  it("should clear the document and the status on reset", () => {
    const repository = createInMemoryPreferencesRepository({
      initialDocument: { status: PreferencesLoadStatus.UNREADABLE },
    });
    const { result } = renderPreferences(repository);
    act(() => result.current.resetPreferences());
    expect(result.current.loadStatus).toBe(PreferencesStatus.READY);
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });

  it("should report a failed save and keep the choice", () => {
    const { result, writeScheduler } = renderPreferences(
      createInMemoryPreferencesRepository({ isWritable: false }),
    );
    act(() => result.current.setTheme(ThemePreference.DARK));
    act(() => writeScheduler.runPending());
    expect(result.current.hasSaveFailed).toBe(true);
    expect(result.current.preferences.theme).toBe(ThemePreference.DARK);
  });
});

function createSharedPair() {
  const backend = createInMemoryPreferencesBackend();
  return {
    first: createInMemoryPreferencesRepository({ backend }),
    second: createInMemoryPreferencesRepository({ backend }),
  };
}
