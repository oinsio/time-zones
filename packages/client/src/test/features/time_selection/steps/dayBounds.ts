import {
  NANOSECONDS_PER_MINUTE,
  TRACK_END_BEFORE_DAY_END_MINUTES,
} from "@/constants";
import { Temporal } from "@/lib/temporal";

// Verifies FR1, FR2, FR3, FR4 of fix-day-track-handle-overlap-and-end-of-day.
/** Start and end of the reference day, worked out from a card's track and the instant it shows. */
export const getDayBounds = (
  track: { fraction: number; maxMinutes: number },
  effectiveInstant: string,
) => {
  const lengthMinutes = track.maxMinutes + TRACK_END_BEFORE_DAY_END_MINUTES;
  const start = Temporal.Instant.from(effectiveInstant)
    .subtract({
      nanoseconds: Math.round(
        track.fraction * lengthMinutes * NANOSECONDS_PER_MINUTE,
      ),
    })
    .round({ smallestUnit: "minute" });
  return {
    start,
    end: start.add({ minutes: lengthMinutes }),
    lengthMinutes,
  };
};
