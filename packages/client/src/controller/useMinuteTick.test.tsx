// Verifies FR3 of show-local-time-and-date-on-location-cards (D4).
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type Clock, fakeClock } from "@/lib/temporal";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { useMinuteTick } from "./useMinuteTick";

const setup = (startTimestamp: string) => {
  let currentClock = fakeClock(startTimestamp);
  const clock: Clock = {
    instant: () => currentClock.instant(),
    plainDateISO: () => currentClock.plainDateISO(),
    timeZoneId: () => currentClock.timeZoneId(),
  };
  const tickScheduler = createManualTickScheduler();
  const onTick = vi.fn();
  const rendered = renderHook(() =>
    useMinuteTick({ clock, tickScheduler, onTick }),
  );
  return {
    tickScheduler,
    onTick,
    rendered,
    moveClockTo: (timestamp: string) => {
      currentClock = fakeClock(timestamp);
    },
  };
};

describe("useMinuteTick", () => {
  afterEach(resetPageVisibility);

  it("should schedule the first tick at the next minute boundary without ticking", () => {
    const { tickScheduler, onTick } = setup("2026-07-15T12:00:42.500Z");
    expect([tickScheduler.lastDelayMs(), onTick.mock.calls.length]).toEqual([
      17_500, 0,
    ]);
  });

  it("should call onTick and schedule a full minute when the tick runs on the boundary", () => {
    const { tickScheduler, onTick, moveClockTo } = setup(
      "2026-07-15T12:00:42.500Z",
    );
    moveClockTo("2026-07-15T12:01:00Z");
    tickScheduler.runPending();
    expect([onTick.mock.calls.length, tickScheduler.lastDelayMs()]).toEqual([
      1, 60_000,
    ]);
  });

  it("should cancel the pending tick when the page becomes hidden", () => {
    const { tickScheduler, onTick } = setup("2026-07-15T12:00:42.500Z");
    setPageVisibility("hidden");
    expect([tickScheduler.hasPending(), onTick.mock.calls.length]).toEqual([
      false,
      0,
    ]);
  });

  it("should tick at once and realign when the page becomes visible", () => {
    const { tickScheduler, onTick, moveClockTo } = setup(
      "2026-07-15T12:00:42.500Z",
    );
    setPageVisibility("hidden");
    moveClockTo("2026-07-15T12:10:20Z");
    setPageVisibility("visible");
    expect([onTick.mock.calls.length, tickScheduler.lastDelayMs()]).toEqual([
      1, 40_000,
    ]);
  });

  it("should schedule nothing when mounted while the page is hidden", () => {
    setPageVisibility("hidden");
    const { tickScheduler } = setup("2026-07-15T12:00:42.500Z");
    expect(tickScheduler.hasPending()).toBe(false);
  });

  it("should cancel the tick and stop listening on unmount", () => {
    const { tickScheduler, onTick, rendered } = setup(
      "2026-07-15T12:00:42.500Z",
    );
    rendered.unmount();
    setPageVisibility("visible");
    expect([tickScheduler.hasPending(), onTick.mock.calls.length]).toEqual([
      false,
      0,
    ]);
  });

  it("should not reschedule when the onTick callback changes", () => {
    const clock = fakeClock("2026-07-15T12:00:42.500Z");
    const schedule = vi.fn(() => () => undefined);
    const tickScheduler = { schedule };
    const { rerender } = renderHook(
      ({ onTick }) => useMinuteTick({ clock, tickScheduler, onTick }),
      { initialProps: { onTick: () => undefined } },
    );
    rerender({ onTick: () => undefined });
    expect(schedule).toHaveBeenCalledOnce();
  });
});
