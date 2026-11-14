// Verifies FR3, FR7, FR9 of add-day-colouring-setting.
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { DayColouring, DEFAULT_WORKING_HOURS } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { useDayColouring } from "./useDayColouring";
import { usePreferences } from "./usePreferences";

function renderPreferences(repository = createInMemoryPreferencesRepository()) {
  const writeScheduler = createManualWriteScheduler();
  const view = renderHook(
    () => ({ preferences: usePreferences(), colouring: useDayColouring() }),
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
  return { ...view, repository, writeScheduler };
}

describe("PreferencesProvider day colouring", () => {
  it("should apply a colouring at once and write it once after the debounce", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    const saveSpy = vi.spyOn(repository, "save");
    act(() =>
      result.current.preferences.setDayColouring(DayColouring.WORKING_HOURS),
    );
    expect(result.current.colouring.dayColouring).toBe(
      DayColouring.WORKING_HOURS,
    );
    expect(saveSpy).not.toHaveBeenCalled();
    act(() => writeScheduler.runPending());
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(repository.load()).toMatchObject({
      preferences: { dayColouring: DayColouring.WORKING_HOURS },
    });
  });

  it("should store the working hours and keep them across a colouring change", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    act(() =>
      result.current.preferences.setWorkingHours({
        start: "09:07",
        end: "17:30",
      }),
    );
    act(() => result.current.preferences.setDayColouring(DayColouring.PLAIN));
    act(() => writeScheduler.runPending());
    expect(repository.load()).toMatchObject({
      preferences: { workingHours: { start: "09:07", end: "17:30" } },
    });
  });

  it("should not write for an invalid range", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    const saveSpy = vi.spyOn(repository, "save");
    act(() =>
      result.current.preferences.setWorkingHours({
        start: "18:00",
        end: "10:00",
      }),
    );
    act(() => writeScheduler.runPending());
    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.current.colouring.workingHours).toBe(DEFAULT_WORKING_HOURS);
  });

  it("should apply a change made by another tab", () => {
    const backend = createInMemoryPreferencesBackend();
    const first = createInMemoryPreferencesRepository({ backend });
    const second = createInMemoryPreferencesRepository({ backend });
    const { result } = renderPreferences(first);
    act(() => {
      second.save({
        ...result.current.preferences.preferences,
        dayColouring: DayColouring.PLAIN,
        workingHours: { start: "08:00", end: "16:00" },
      });
    });
    expect(result.current.colouring).toEqual({
      dayColouring: DayColouring.PLAIN,
      workingHours: { start: "08:00", end: "16:00" },
    });
  });
});

describe("useDayColouring", () => {
  it("should return the defaults outside a provider", () => {
    const { result } = renderHook(() => useDayColouring());
    expect(result.current).toEqual({
      dayColouring: DayColouring.TIME_OF_DAY,
      workingHours: DEFAULT_WORKING_HOURS,
    });
  });
});
