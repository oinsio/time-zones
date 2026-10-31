// Verifies FR8, FR9, FR12, FR13, NFR-P2 of add-settings-page-and-device-time-location (D3, D4).
import { act } from "@testing-library/react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { type LocationsLoadResult, LocationsLoadStatus } from "@/ports";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { moscow, renderLocations } from "@/test/renderLocations";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";

const INSTANT = "2026-07-15T12:00:00Z";
const ALMATY_INPUT = { ...KNOWN_CITIES.Almaty, label: "Almaty" };

const setup = (
  initialDocument: LocationsLoadResult = {
    status: LocationsLoadStatus.EMPTY,
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

const rowIdsOf = (result: ReturnType<typeof setup>["result"]) =>
  result.current.rows.map((row) => row.id);

describe("useLocations device time location", () => {
  it("should list the device time location alone on the first launch", () => {
    const { result } = setup();

    expect(rowIdsOf(result)).toEqual([DEVICE_TIME_LOCATION_ID]);
  });

  it("should write nothing on the first launch", () => {
    const { repository, writeScheduler } = setup();
    const save = vi.spyOn(repository, "save");

    writeScheduler.runPending();

    expect(save).not.toHaveBeenCalled();
  });

  it("should keep a stored empty list empty", () => {
    const { result } = setup({
      status: LocationsLoadStatus.LOADED,
      locations: [],
      homeLocationId: null,
    });

    expect(rowIdsOf(result)).toEqual([]);
  });

  it("should add the device time location back and write the list", () => {
    const { result, writeScheduler, repository } = setup({
      status: LocationsLoadStatus.LOADED,
      locations: [moscow],
      homeLocationId: null,
    });

    act(() => {
      result.current.addDeviceTimeLocation();
    });
    act(() => writeScheduler.runPending());

    expect(rowIdsOf(result)).toEqual([moscow.id, DEVICE_TIME_LOCATION_ID]);
    expect(repository.load()).toMatchObject({
      status: LocationsLoadStatus.LOADED,
    });
  });

  it("should refuse a second device time location", () => {
    const { result } = setup();

    let outcome: ReturnType<typeof result.current.addDeviceTimeLocation>;
    act(() => {
      outcome = result.current.addDeviceTimeLocation();
    });

    expect(outcome!.ok).toBe(false);
  });

  it("should show the first-launch list again after a reset, writing nothing", () => {
    const { result, repository } = setup({
      status: LocationsLoadStatus.LOADED,
      locations: [moscow],
      homeLocationId: null,
    });

    act(() => result.current.resetLocations());

    expect(rowIdsOf(result)).toEqual([DEVICE_TIME_LOCATION_ID]);
    expect(repository.load()).toEqual({ status: LocationsLoadStatus.EMPTY });
  });

  it("should name the device time location from the zone ID at first", () => {
    const { result } = setup();

    expect(result.current.rows[0]?.cityLabel).toBe("Almaty");
  });

  it("should not add a city location for the device zone", () => {
    const { result } = setup();

    act(() => {
      result.current.addLocation(ALMATY_INPUT);
    });

    expect(rowIdsOf(result)).toEqual([
      DEVICE_TIME_LOCATION_ID,
      "Asia/Almaty|Almaty",
    ]);
  });

  it("should follow a device time zone change read at a minute tick", () => {
    const { result, clock, tickScheduler } = setup();

    clock.moveTo(INSTANT, "Europe/Moscow");
    act(() => tickScheduler.runPending());

    expect(result.current.rows[0]?.utcOffsetLabel).toBe("UTC+3");
  });

  it("should follow a list change from another tab", () => {
    const { result, otherTab } = setup();

    act(() => {
      otherTab.save({ locations: [moscow], homeLocationId: null });
    });

    expect(rowIdsOf(result)).toEqual([moscow.id]);
  });

  it("should list nothing for an unreadable stored list", () => {
    const { result } = setup({ status: LocationsLoadStatus.UNREADABLE });

    expect(result.current.loadStatus).toBe("UNREADABLE");
  });
});
