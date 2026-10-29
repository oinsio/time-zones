// Verifies FR2, FR6, FR8 of show-here-entry-for-device-time (D4).
import zoneCities from "virtual:zone-cities";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider } from "@/controller";
import { type LoadCitySearch, LocationsLoadStatus } from "@/ports";
import { almaty, moscow } from "@/test/renderLocations";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useHereEntry } from "./useHereEntry";
import { useTimeSelection } from "./useTimeSelection";

const INSTANT = "2026-03-08T07:30:00Z";
const SELECTED_FRACTION = 0.75;

function setup(locations = [moscow]) {
  const load: LoadCitySearch = vi.fn(async () =>
    createCompositeCitySearch(zoneCities),
  );
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations,
      homeLocationId: null,
    },
  });
  const rendered = renderHook(
    () => ({
      hereEntry: useHereEntry(),
      time: useTimeSelection(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={createManualWriteScheduler()}
          clock={createSwitchableClock(INSTANT, "Asia/Almaty")}
          tickScheduler={createManualTickScheduler()}
          loadCitySearch={load}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  return { ...rendered, load };
}

describe("useHereEntry", () => {
  it("should present the device zone with the exemplar city", async () => {
    const { result } = setup();

    expect(result.current.hereEntry?.cityLabel).toBe("Almaty");
    await waitFor(() =>
      expect(result.current.hereEntry?.cityLabel).toBe("Алматы"),
    );
    expect(result.current.hereEntry?.localTimeLabel).toBe("12:30");
  });

  it("should follow the reference moment after a time selection", () => {
    const { result } = setup();
    act(() => result.current.time.selectTrackFraction(SELECTED_FRACTION));

    expect(result.current.hereEntry?.localTimeLabel).toBe("18:00");
  });

  it("should give nothing while a location matches the device zone", () => {
    const { result, load } = setup([almaty]);

    expect(result.current.hereEntry).toBeUndefined();
    expect(load).not.toHaveBeenCalled();
  });

  it("should load the city data through the loader of the provider", async () => {
    const { load } = setup();

    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  });
});
