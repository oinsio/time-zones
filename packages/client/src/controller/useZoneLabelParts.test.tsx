// Verifies FR13 of show-zone-abbreviations-and-zone-label-setting (D4).
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { DEFAULT_PREFERENCES, ZoneLabelPart } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";
import { useZoneLabelParts } from "./useZoneLabelParts";

describe("useZoneLabelParts", () => {
  it("should be the default outside a provider", () => {
    const { result } = renderHook(() => useZoneLabelParts());
    expect(result.current).toEqual(DEFAULT_PREFERENCES.zoneLabelParts);
  });

  it("should follow the preferences inside a provider", () => {
    const { result } = renderHook(
      () => ({ parts: useZoneLabelParts(), preferences: usePreferences() }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PreferencesProvider
            repository={createInMemoryPreferencesRepository()}
            writeScheduler={createManualWriteScheduler()}
          >
            {children}
          </PreferencesProvider>
        ),
      },
    );
    act(() =>
      result.current.preferences.setZoneLabelPart(
        ZoneLabelPart.UTC_OFFSET,
        false,
      ),
    );
    expect(result.current.parts).toEqual([
      ZoneLabelPart.ZONE_ABBREVIATION,
      ZoneLabelPart.COUNTRY,
    ]);
  });
});
