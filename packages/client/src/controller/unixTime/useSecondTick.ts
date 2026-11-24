import { useEffect, useRef } from "react";
import { VISIBILITY_CHANGE_EVENT, VISIBLE_STATE } from "@/constants";
import type { Clock } from "@/lib/temporal";
import { getMillisecondsUntilNextSecond } from "../minuteBoundary";
import type { TickScheduler } from "../tickScheduler";

type SecondTickOptions = {
  clock: Clock;
  tickScheduler: TickScheduler;
  /** Ticks only while true: the converter is live. */
  isEnabled: boolean;
  onTick: () => void;
};

/**
 * Calls `onTick` at every second boundary while enabled and the page is
 * visible, pauses while it is hidden and ticks at once when it becomes
 * visible again. A sibling of `useMinuteTick` on the same `TickScheduler`.
 * Implements FR14, NFR-P2 of add-unix-time-converter-tool (D8).
 */
export function useSecondTick({
  clock,
  tickScheduler,
  isEnabled,
  onTick,
}: SecondTickOptions) {
  const latestOnTick = useRef(onTick);
  latestOnTick.current = onTick;

  useEffect(() => {
    if (!isEnabled) return;
    let cancelPendingTick: (() => void) | undefined;
    const cancelTick = () => {
      cancelPendingTick?.();
      cancelPendingTick = undefined;
    };
    const scheduleNextTick = () => {
      cancelTick();
      cancelPendingTick = tickScheduler.schedule(() => {
        latestOnTick.current();
        scheduleNextTick();
      }, getMillisecondsUntilNextSecond(clock.instant()));
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === VISIBLE_STATE) {
        latestOnTick.current();
        scheduleNextTick();
      } else {
        cancelTick();
      }
    };
    if (document.visibilityState === VISIBLE_STATE) scheduleNextTick();
    document.addEventListener(VISIBILITY_CHANGE_EVENT, handleVisibilityChange);
    return () => {
      cancelTick();
      document.removeEventListener(
        VISIBILITY_CHANGE_EVENT,
        handleVisibilityChange,
      );
    };
  }, [clock, tickScheduler, isEnabled]);
}
