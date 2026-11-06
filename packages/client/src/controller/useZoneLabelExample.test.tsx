// Verifies FR14 of show-zone-abbreviations-and-zone-label-setting (D7).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { vi } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { fakeClock } from "@/lib/temporal";
import { ZoneLabelPart } from "@/preferences";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";
import { useZoneLabelExample } from "./useZoneLabelExample";

function renderExample() {
  return renderHook(
    () => ({ example: useZoneLabelExample(), preferences: usePreferences() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={createInMemoryPreferencesRepository()}
          writeScheduler={createManualWriteScheduler()}
        >
          <LocationsProvider
            repository={createInMemoryLocationRepository()}
            writeScheduler={immediateWriteScheduler}
            clock={fakeClock("2026-07-15T12:00:00Z")}
            tickScheduler={createManualTickScheduler()}
          >
            {children}
          </LocationsProvider>
        </PreferencesProvider>
      ),
    },
  );
}

const textsOf = (parts: readonly { text: string }[]) =>
  parts.map((part) => part.text);

describe("useZoneLabelExample", () => {
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should give the example of Moscow with both parts by default", async () => {
    await i18n.changeLanguage("en");
    const { result } = renderExample();
    expect(textsOf(result.current.example)).toEqual(["Russia", "MSK", "UTC+3"]);
  });

  it("should follow the active language", async () => {
    await i18n.changeLanguage("ru");
    const { result } = renderExample();
    expect(textsOf(result.current.example)).toEqual(["Россия", "МСК", "UTC+3"]);
  });

  it("should change in the same render as a toggle", async () => {
    await i18n.changeLanguage("en");
    const { result } = renderExample();
    act(() =>
      result.current.preferences.setZoneLabelPart(
        ZoneLabelPart.ZONE_ABBREVIATION,
        false,
      ),
    );
    expect(textsOf(result.current.example)).toEqual(["Russia", "UTC+3"]);
  });

  it("should refuse to run outside a LocationsProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useZoneLabelExample())).toThrow(
      "useZoneLabelExample must be used inside a LocationsProvider",
    );
  });
});
