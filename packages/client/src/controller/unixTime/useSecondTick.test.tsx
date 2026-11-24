// Verifies FR14, NFR-P2 of add-unix-time-converter-tool.
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type Clock, fakeClock } from "@/lib/temporal";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { getMillisecondsUntilNextSecond } from "../minuteBoundary";
import { useSecondTick } from "./useSecondTick";

const setup = (startTimestamp: string, isEnabled = true) => {
  let currentClock = fakeClock(startTimestamp);
  const clock: Clock = {
    instant: () => currentClock.instant(),
    plainDateISO: () => currentClock.plainDateISO(),
    timeZoneId: () => currentClock.timeZoneId(),
  };
  const tickScheduler = createManualTickScheduler();
  const onTick = vi.fn();
  const rendered = renderHook(
    ({ isEnabled: isTicking }) =>
      useSecondTick({ clock, tickScheduler, isEnabled: isTicking, onTick }),
    { initialProps: { isEnabled } },
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

describe("getMillisecondsUntilNextSecond", () => {
  it.each([
    ["2026-07-15T12:00:42.250Z", 750],
    ["2026-07-15T12:00:42.000Z", 1000],
    ["2026-07-15T12:00:42.999Z", 1],
  ])("should give the delay from %s as %i ms", (timestamp, expected) => {
    expect(getMillisecondsUntilNextSecond(fakeClock(timestamp).instant())).toBe(
      expected,
    );
  });
});

describe("useSecondTick", () => {
  afterEach(resetPageVisibility);

  it("should schedule the first tick at the next second boundary without ticking", () => {
    const { tickScheduler, onTick } = setup("2026-07-15T12:00:42.250Z");
    expect([tickScheduler.lastDelayMs(), onTick.mock.calls.length]).toEqual([
      750, 0,
    ]);
  });

  it("should call onTick and schedule a full second when the tick runs on the boundary", () => {
    const { tickScheduler, onTick, moveClockTo } = setup(
      "2026-07-15T12:00:42.250Z",
    );
    moveClockTo("2026-07-15T12:00:43Z");
    tickScheduler.runPending();
    expect([onTick.mock.calls.length, tickScheduler.lastDelayMs()]).toEqual([
      1, 1000,
    ]);
  });

  it("should schedule nothing while disabled", () => {
    const { tickScheduler } = setup("2026-07-15T12:00:42.250Z", false);
    expect(tickScheduler.hasPending()).toBe(false);
  });

  it("should stop when disabled and start when enabled", () => {
    const { tickScheduler, rendered } = setup("2026-07-15T12:00:42.250Z");
    rendered.rerender({ isEnabled: false });
    expect(tickScheduler.hasPending()).toBe(false);
    rendered.rerender({ isEnabled: true });
    expect(tickScheduler.hasPending()).toBe(true);
  });

  it("should pause while the page is hidden and tick at once on return", () => {
    const { tickScheduler, onTick } = setup("2026-07-15T12:00:42.250Z");
    setPageVisibility("hidden");
    expect(tickScheduler.hasPending()).toBe(false);
    setPageVisibility("visible");
    expect([onTick.mock.calls.length, tickScheduler.hasPending()]).toEqual([
      1,
      true,
    ]);
  });

  it("should not schedule when mounted on a hidden page", () => {
    setPageVisibility("hidden");
    const { tickScheduler } = setup("2026-07-15T12:00:42.250Z");
    expect(tickScheduler.hasPending()).toBe(false);
  });

  it("should cancel its tick on unmount", () => {
    const { tickScheduler, rendered } = setup("2026-07-15T12:00:42.250Z");
    rendered.unmount();
    expect(tickScheduler.hasPending()).toBe(false);
  });
});
