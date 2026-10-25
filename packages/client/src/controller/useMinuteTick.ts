import { useEffect, useRef } from "react";
import type { Clock } from "@/lib/temporal";
import { getMillisecondsUntilNextMinute } from "./minuteBoundary";
import type { TickScheduler } from "./tickScheduler";

const VISIBILITY_CHANGE_EVENT = "visibilitychange";
const VISIBLE_STATE: DocumentVisibilityState = "visible";

type MinuteTickOptions = {
  clock: Clock;
  tickScheduler: TickScheduler;
  onTick: () => void;
};

/**
 * Calls `onTick` at every minute boundary while the page is visible, pauses
 * while it is hidden and ticks at once when it becomes visible again.
 * Implements FR3, FR4 of show-local-time-and-date-on-location-cards (D4).
 */
export function useMinuteTick({
  clock,
  tickScheduler,
  onTick,
}: MinuteTickOptions) {
  const latestOnTick = useRef(onTick);
  latestOnTick.current = onTick;

  useEffect(() => {
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
      }, getMillisecondsUntilNextMinute(clock.instant()));
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
  }, [clock, tickScheduler]);
}
