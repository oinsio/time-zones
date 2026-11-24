// Verifies FR9, FR18 of add-unix-time-converter-tool.
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createInMemoryLocationRepository } from "@/adapters";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { LocationsStatus } from "./locationsContext";
import { useLocationList } from "./useLocationList";
import { useLocations } from "./useLocations";

const clock = createSwitchableClock("2026-11-23T11:23:07Z", "Asia/Almaty");
const wrapper = ({ children }: { children: ReactNode }) => (
  <LocationsProvider
    repository={createInMemoryLocationRepository()}
    writeScheduler={immediateWriteScheduler}
    clock={clock}
    tickScheduler={createManualTickScheduler()}
  >
    {children}
  </LocationsProvider>
);

describe("useLocationList", () => {
  it("should give the device time location of a first launch, the device zone and the clock", () => {
    const { result } = renderHook(() => useLocationList(), { wrapper });
    expect(result.current.locations.map(({ id }) => id)).toEqual([
      DEVICE_TIME_LOCATION_ID,
    ]);
    expect(result.current).toMatchObject({
      deviceTimeZoneId: "Asia/Almaty",
      homeLocationId: null,
      loadStatus: LocationsStatus.READY,
      clock,
    });
  });

  it("should follow changes of the list at once", () => {
    const { result } = renderHook(
      () => ({ list: useLocationList(), commands: useLocations() }),
      { wrapper },
    );
    act(() => {
      result.current.commands.addLocation({
        timeZoneId: "Europe/Moscow",
        label: "Moscow",
        countryCode: "RU",
      });
    });
    expect(result.current.list.locations).toHaveLength(2);
  });

  it("should throw outside a LocationsProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLocationList())).toThrow(
      "useLocationList must be used inside a LocationsProvider",
    );
  });
});
