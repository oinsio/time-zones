// Verifies FR9, FR10 of apply-data-updates-silently.
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { almaty, moscow, moscowInput } from "@/test/renderLocations";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { useWatchedZoneIds } from "./useWatchedZoneIds";

const renderWatched = () =>
  renderHook(() => ({ zones: useWatchedZoneIds(), list: useLocations() }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={createInMemoryLocationRepository({
          initialDocument: {
            status: LocationsLoadStatus.LOADED,
            locations: [moscow, almaty],
            homeLocationId: null,
          },
        })}
        writeScheduler={immediateWriteScheduler}
      >
        {children}
      </LocationsProvider>
    ),
  });

describe("useWatchedZoneIds", () => {
  it("should throw outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useWatchedZoneIds())).toThrow(
      /LocationsProvider/,
    );
    vi.restoreAllMocks();
  });

  it("should name the zones of the list and the device time zone", () => {
    const { result } = renderWatched();
    expect(result.current.zones).toEqual(
      expect.arrayContaining(["Europe/Moscow", "Asia/Almaty"]),
    );
  });

  it("should keep the same array while the zones do not change", () => {
    const { result, rerender } = renderWatched();
    const firstZones = result.current.zones;
    rerender();
    expect(result.current.zones).toBe(firstZones);
  });

  it("should change the array when a zone is added", () => {
    const { result } = renderWatched();
    const firstZones = result.current.zones;
    act(() => {
      result.current.list.addLocation({
        ...moscowInput,
        timeZoneId: "Africa/Cairo",
        label: "Cairo",
        countryCode: "EG",
      });
    });
    expect(result.current.zones).not.toBe(firstZones);
    expect(result.current.zones).toContain("Africa/Cairo");
  });
});
