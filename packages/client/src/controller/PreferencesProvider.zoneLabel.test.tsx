// Verifies FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4).
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { ZoneLabelPart } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";

function renderPreferences() {
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
}

describe("PreferencesProvider zone label", () => {
  it("should apply a zone label toggle at once and write it once after the debounce", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    const saveSpy = vi.spyOn(repository, "save");
    act(() =>
      result.current.setZoneLabelPart(ZoneLabelPart.ZONE_ABBREVIATION, false),
    );
    expect(result.current.preferences.zoneLabelParts).toEqual([
      ZoneLabelPart.UTC_OFFSET,
    ]);
    expect(saveSpy).not.toHaveBeenCalled();
    act(() => writeScheduler.runPending());
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(repository.load()).toMatchObject({
      preferences: { zoneLabelParts: [ZoneLabelPart.UTC_OFFSET] },
    });
  });

  it("should not schedule a write for an unchanged part", () => {
    const { result, writeScheduler, repository } = renderPreferences();
    const saveSpy = vi.spyOn(repository, "save");
    act(() => result.current.setZoneLabelPart(ZoneLabelPart.UTC_OFFSET, true));
    act(() => writeScheduler.runPending());
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
