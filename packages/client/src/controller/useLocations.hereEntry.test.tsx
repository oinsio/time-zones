// Verifies FR1, FR6, FR9 of show-here-entry-for-device-time (D4).
import { act } from "@testing-library/react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { type LocationsLoadResult, LocationsLoadStatus } from "@/ports";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { almaty, moscow, renderLocations } from "@/test/renderLocations";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";

const INSTANT = "2026-07-15T12:00:00Z";
const ALMATY_INPUT = { ...KNOWN_CITIES.Almaty, label: "Almaty" };
const ALMATY_HERE_ENTRY = { timeZoneId: "Asia/Almaty" };

const setup = (
  initialDocument: LocationsLoadResult = {
    status: LocationsLoadStatus.LOADED,
    locations: [moscow],
    homeLocationId: null,
  },
) => {
  const backend = createInMemoryLocationBackend(initialDocument);
  const repository = createInMemoryLocationRepository({ backend });
  const otherTab = createInMemoryLocationRepository({ backend });
  const clock = createSwitchableClock(INSTANT, "Asia/Almaty");
  const tickScheduler = createManualTickScheduler();
  const writeScheduler = createManualWriteScheduler();
  const view = renderLocations(
    repository,
    writeScheduler,
    clock,
    tickScheduler,
  );
  return {
    ...view,
    repository,
    otherTab,
    clock,
    tickScheduler,
    writeScheduler,
  };
};

describe("useLocations Here entry", () => {
  it("should show the Here entry while no location matches the device zone", () => {
    const { result } = setup();

    expect(result.current.hereEntry).toEqual(ALMATY_HERE_ENTRY);
  });

  it("should hide it after the matching location is added and show it again after removal", () => {
    const { result } = setup();

    act(() => result.current.addLocation(ALMATY_INPUT));
    expect(result.current.hereEntry).toBeUndefined();
    act(() => result.current.removeLocation(almaty.id));
    expect(result.current.hereEntry).toEqual(ALMATY_HERE_ENTRY);
  });

  it("should show it again after a reset", () => {
    const { result } = setup({
      status: LocationsLoadStatus.LOADED,
      locations: [almaty],
      homeLocationId: null,
    });
    expect(result.current.hereEntry).toBeUndefined();

    act(() => result.current.resetLocations());

    expect(result.current.hereEntry).toEqual(ALMATY_HERE_ENTRY);
  });

  it("should follow a device time zone change read at a minute tick", () => {
    const { result, clock, tickScheduler } = setup();

    clock.moveTo(INSTANT, "Europe/Moscow");
    act(() => tickScheduler.runPending());

    expect(result.current.hereEntry).toBeUndefined();
  });

  it("should follow a list change from another tab", () => {
    const { result, otherTab } = setup();

    act(() => {
      otherTab.save({ locations: [moscow, almaty], homeLocationId: null });
    });

    expect(result.current.hereEntry).toBeUndefined();
  });

  it("should give no Here entry for an unreadable stored list", () => {
    const { result } = setup({ status: LocationsLoadStatus.UNREADABLE });

    expect(result.current.hereEntry).toBeUndefined();
  });

  it("should write nothing for the Here entry", () => {
    const { repository, writeScheduler } = setup();
    const save = vi.spyOn(repository, "save");

    writeScheduler.runPending();

    expect(save).not.toHaveBeenCalled();
  });
});
