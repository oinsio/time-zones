// Verifies FR3, FR4, FR5 of show-local-time-and-date-on-location-cards (D4).
import { act } from "@testing-library/react";
import { createInMemoryLocationRepository } from "@/adapters";
import { type Clock, fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { renderLocations } from "@/test/renderLocations";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";

const BADGE_RU = "здесь";

const cityOf = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });

function setup(cities: string[], startTimestamp: string, deviceZone = "UTC") {
  let currentClock = fakeClock(startTimestamp, deviceZone);
  const clock: Clock = {
    instant: () => currentClock.instant(),
    plainDateISO: () => currentClock.plainDateISO(),
    timeZoneId: () => currentClock.timeZoneId(),
  };
  const tickScheduler = createManualTickScheduler();
  const writeScheduler = createManualWriteScheduler();
  const rendered = renderLocations(
    createInMemoryLocationRepository({
      initialDocument: {
        status: LocationsLoadStatus.LOADED,
        locations: cities.map(cityOf),
        homeLocationId: null,
      },
    }),
    writeScheduler,
    clock,
    tickScheduler,
  );
  return {
    ...rendered,
    tickScheduler,
    writeScheduler,
    moveClockTo: (timestamp: string, zone = deviceZone) => {
      currentClock = fakeClock(timestamp, zone);
    },
    runTick: () => act(() => tickScheduler.runPending()),
  };
}

describe("useLocations minute tick", () => {
  it("should show the new minute after a tick", () => {
    const { result, moveClockTo, runTick } = setup(
      ["UTC"],
      "2026-07-15T12:00:42.500Z",
    );
    moveClockTo("2026-07-15T12:01:00Z");
    runTick();
    expect(result.current.rows[0]?.localTimeLabel).toBe("12:01");
  });

  it("should show the following minute after a second tick", () => {
    const { result, moveClockTo, runTick } = setup(
      ["UTC"],
      "2026-07-15T12:00:42.500Z",
    );
    moveClockTo("2026-07-15T12:01:00Z");
    runTick();
    moveClockTo("2026-07-15T12:02:00Z");
    runTick();
    expect(result.current.rows[0]?.localTimeLabel).toBe("12:02");
  });

  it("should show the DST offset change after a tick", () => {
    const { result, moveClockTo, runTick } = setup(
      ["New York"],
      "2026-03-08T06:59:30Z",
    );
    const before = result.current.rows[0];
    moveClockTo("2026-03-08T07:00:00Z");
    runTick();
    const after = result.current.rows[0];
    expect([
      before?.localTimeLabel,
      before?.utcOffsetLabel,
      after?.localTimeLabel,
      after?.utcOffsetLabel,
    ]).toEqual(["01:59", "UTC−5", "03:00", "UTC−4"]);
  });

  it("should move the badge when the device zone changed before a tick", () => {
    const { result, moveClockTo, runTick } = setup(
      ["Almaty", "Moscow"],
      "2026-07-15T12:00:00Z",
      "Asia/Almaty",
    );
    moveClockTo("2026-07-15T12:01:00Z", "Europe/Moscow");
    runTick();
    expect(result.current.rows.map((row) => row.mark?.caption ?? "")).toEqual([
      "",
      BADGE_RU,
    ]);
  });

  it("should schedule no write across three ticks", () => {
    const { writeScheduler, runTick } = setup(["UTC"], "2026-07-15T12:00:00Z");
    runTick();
    runTick();
    runTick();
    expect(writeScheduler.lastDelayMs()).toBeUndefined();
  });

  it("should read the instant again but not the device zone when the list changes", () => {
    const { result, moveClockTo } = setup(
      ["UTC"],
      "2026-07-15T12:00:42.500Z",
      "Asia/Almaty",
    );
    moveClockTo("2026-07-15T12:05:10Z", "Europe/Moscow");
    act(() =>
      result.current.addLocation({ ...KNOWN_CITIES.Moscow, label: "Moscow" }),
    );
    expect([
      result.current.rows.map((row) => row.localTimeLabel),
      result.current.rows.map((row) => row.mark?.caption ?? ""),
    ]).toEqual([
      ["12:05", "15:05"],
      ["", ""],
    ]);
  });
});
