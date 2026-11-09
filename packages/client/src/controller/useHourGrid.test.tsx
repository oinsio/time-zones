// Verifies FR8, FR9 of add-grid-hour-cells-and-hour-frame (D3).
import { act, renderHook } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import { describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationCommandType, TrackMove, WallTimeTargetKind } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationsContext } from "./locationsContext";
import { useHourGrid } from "./useHourGrid";
import { useTimeSelection } from "./useTimeSelection";

const SAMPLE_TIMESTAMP = "2026-03-08T07:30:00Z";
const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });
const BROKEN_ZONE_ROW = buildLocation({
  label: "Nowhere",
  timeZoneId: "Not/AZone",
});

function setup(locations = [cityRow("Almaty"), cityRow("Moscow")]) {
  const clock = createSwitchableClock(SAMPLE_TIMESTAMP, "Asia/Almaty");
  const tickScheduler = createManualTickScheduler();
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations,
      homeLocationId: null,
    },
  });
  const rendered = renderHook(
    () => ({
      grid: useHourGrid(),
      time: useTimeSelection(),
      store: useContext(LocationsContext)?.store,
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={tickScheduler}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  const moveClockTo = (timestamp: string) => {
    clock.moveTo(timestamp);
    act(() => tickScheduler.runPending());
  };
  const dispatch = (
    command: Parameters<
      NonNullable<typeof rendered.result.current.store>["dispatch"]
    >[0],
  ) =>
    act(() => {
      rendered.result.current.store?.dispatch(command);
    });
  return { ...rendered, moveClockTo, dispatch };
}

describe("useHourGrid", () => {
  it("should give one strip per location", () => {
    const { result } = setup();

    expect(result.current.grid.strips.size).toBe(2);
  });

  it("should count 24 cells on an ordinary day", () => {
    const { result } = setup();

    expect(result.current.grid.cellCount).toBe(24);
  });

  it("should frame column 12 at 07:30Z", () => {
    const { result } = setup();

    expect(result.current.grid.hourFrameIndex).toBe(12);
  });

  it("should move a live frame to column 13 at 08:00Z", () => {
    const { result, moveClockTo } = setup();

    moveClockTo("2026-03-08T08:00:00Z");

    expect(result.current.grid.hourFrameIndex).toBe(13);
  });

  it("should keep a frame pinned by a typed time while the clock passes the hour", () => {
    const { result, moveClockTo, dispatch } = setup();
    const almatyId = [...result.current.grid.strips.keys()][0];

    dispatch({
      type: LocationCommandType.SET_WALL_TIME,
      target: { kind: WallTimeTargetKind.LOCATION, locationId: almatyId },
      time: "12:15",
      date: "2026-03-08",
    });
    moveClockTo("2026-03-08T08:00:00Z");

    expect(result.current.grid.hourFrameIndex).toBe(12);
  });

  it("should keep a frame pinned by the date bar while the clock passes the hour", () => {
    const { result, moveClockTo, dispatch } = setup();

    dispatch({
      type: LocationCommandType.SHIFT_DATE,
      days: 1,
      now: SAMPLE_TIMESTAMP,
    });
    moveClockTo("2026-03-08T08:00:00Z");

    expect(result.current.grid.hourFrameIndex).toBe(12);
  });

  it("should follow a strip move", () => {
    const { result } = setup();

    act(() => result.current.time.moveTrack(TrackMove.HOUR_FORWARD));

    expect(result.current.grid.hourFrameIndex).toBe(13);
  });

  it("should return the frame to the current hour on Now", () => {
    const { result, dispatch } = setup();
    dispatch({
      type: LocationCommandType.SELECT_INSTANT,
      instant: "2026-03-08T02:00:00Z",
    });
    expect(result.current.grid.hourFrameIndex).toBe(7);

    dispatch({ type: LocationCommandType.RESET_TO_NOW });

    expect(result.current.grid.hourFrameIndex).toBe(12);
  });

  it("should give no strip to a zone the engine rejects", () => {
    const { result } = setup([cityRow("Almaty"), BROKEN_ZONE_ROW]);

    expect([...result.current.grid.strips.keys()]).toEqual([
      expect.not.stringContaining(BROKEN_ZONE_ROW.id),
    ]);
  });

  it("should keep every strip object across a tick in the same day", () => {
    const { result, moveClockTo } = setup();
    const stripsBefore = [...result.current.grid.strips.values()];

    moveClockTo("2026-03-08T07:31:00Z");

    expect([...result.current.grid.strips.values()]).toEqual(stripsBefore);
    result.current.grid.strips.forEach((strip, id) =>
      expect(strip).toBe(
        stripsBefore[[...result.current.grid.strips.keys()].indexOf(id)],
      ),
    );
  });
});
