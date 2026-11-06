// Verifies FR5, FR6 of polish-settings-and-remove-offline-update-notice.
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { useContext } from "react";
import { vi } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { fakeClock } from "@/lib/temporal";
import { LocationCommandType } from "@/model";
import { HourFormat } from "@/preferences";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { LocationsContext } from "./locationsContext";
import { PreferencesProvider } from "./PreferencesProvider";
import { useDeployTime } from "./useDeployTime";
import { usePreferences } from "./usePreferences";

const normalizeSpaces = (text: string) => text.replace(/[\u202F\u00A0]/g, " ");

function renderDeployTime() {
  return renderHook(
    () => ({
      deployTime: normalizeSpaces(useDeployTime()),
      preferences: usePreferences(),
      locations: useContext(LocationsContext),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={createInMemoryPreferencesRepository()}
          writeScheduler={createManualWriteScheduler()}
        >
          <LocationsProvider
            repository={createInMemoryLocationRepository()}
            writeScheduler={immediateWriteScheduler}
            clock={fakeClock("2026-11-06T10:30:00Z", "UTC")}
            tickScheduler={createManualTickScheduler()}
          >
            {children}
          </LocationsProvider>
        </PreferencesProvider>
      ),
    },
  );
}

describe("useDeployTime", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should give the build instant, not the clock", () => {
    const { result } = renderDeployTime();
    expect(result.current.deployTime).toBe("Deployed March 8, 2026 at 07:30");
  });

  it("should follow the device time zone", () => {
    const { result } = renderDeployTime();
    act(() =>
      result.current.locations?.store.dispatch({
        type: LocationCommandType.SET_DEVICE_TIME_ZONE,
        timeZoneId: "Asia/Kolkata",
      }),
    );
    expect(result.current.deployTime).toBe("Deployed March 8, 2026 at 13:00");
  });

  it("should follow the hour format", () => {
    const { result } = renderDeployTime();
    act(() => result.current.preferences.setHourFormat(HourFormat.H12));
    expect(result.current.deployTime).toBe("Deployed March 8, 2026 at 7:30 AM");
  });

  it("should follow the interface language", async () => {
    const { result } = renderDeployTime();
    await act(() => i18n.changeLanguage("ru"));
    expect(result.current.deployTime).toBe(
      "Развёрнуто 8 марта 2026 г. в 07:30",
    );
  });

  it("should refuse to run outside a LocationsProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useDeployTime())).toThrow(
      "useDeployTime must be used inside a LocationsProvider",
    );
  });
});
