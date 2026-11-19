// Verifies FR4 of redesign-cards-grid-and-day-palettes.
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesLoadStatus } from "@/ports";
import { DayPalette, DEFAULT_PREFERENCES } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { useDayPalettePreference } from "./useDayPalettePreference";
import { usePreferences } from "./usePreferences";

const wrapperFor =
  (dayPalette?: DayPalette) =>
  ({ children }: { children: ReactNode }) => (
    <PreferencesProvider
      repository={createInMemoryPreferencesRepository({
        initialDocument:
          dayPalette === undefined
            ? undefined
            : {
                status: PreferencesLoadStatus.LOADED,
                preferences: { ...DEFAULT_PREFERENCES, dayPalette },
              },
      })}
      writeScheduler={createManualWriteScheduler()}
    >
      {children}
    </PreferencesProvider>
  );

afterEach(() => {
  delete document.documentElement.dataset.dayPalette;
});

describe("useDayPalettePreference", () => {
  it.each([
    [DayPalette.MUTED, "muted"],
    [DayPalette.VIVID, "vivid"],
  ])("should set data-day-palette for %s", (dayPalette, expected) => {
    renderHook(() => useDayPalettePreference(), {
      wrapper: wrapperFor(dayPalette),
    });
    expect(document.documentElement.dataset.dayPalette).toBe(expected);
  });

  it("should follow setDayPalette", () => {
    const { result } = renderHook(
      () => {
        useDayPalettePreference();
        return usePreferences();
      },
      { wrapper: wrapperFor() },
    );
    act(() => result.current.setDayPalette(DayPalette.MUTED));
    expect(document.documentElement.dataset.dayPalette).toBe("muted");
  });
});
