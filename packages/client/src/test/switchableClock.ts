import { type Clock, fakeClock } from "@/lib/temporal";

export type SwitchableClock = Clock & {
  /** Moves the clock to another instant, optionally in another zone. */
  moveTo: (isoTimestamp: string, timeZone?: string) => void;
};

/** A `fakeClock` that tests can move, for ticks and "now" after browsing. */
export function createSwitchableClock(
  isoTimestamp: string,
  timeZone = "UTC",
): SwitchableClock {
  let current = fakeClock(isoTimestamp, timeZone);
  let currentZone = timeZone;
  return {
    instant: () => current.instant(),
    plainDateISO: () => current.plainDateISO(),
    timeZoneId: () => currentZone,
    moveTo: (nextTimestamp, nextZone = currentZone) => {
      currentZone = nextZone;
      current = fakeClock(nextTimestamp, nextZone);
    },
  };
}
