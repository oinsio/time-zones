import type { DayPeriod, DayPeriodBoundary } from "./dayPeriods";

/**
 * The day period that holds the largest part of a span: the periods the
 * boundaries cut it into, compared by length; on a tie the earlier one.
 * Pure on epoch milliseconds.
 * Implements FR6 of bind-day-periods-to-sun (D5).
 */
export function getLargestSharePeriod(
  boundaries: readonly DayPeriodBoundary[],
  periodWithoutBoundaries: DayPeriod,
  spanStart: number,
  spanEnd: number,
): DayPeriod {
  const lastBefore = boundaries.filter(
    (boundary) => boundary.instant.epochMilliseconds <= spanStart,
  );
  const periodAtStart =
    lastBefore.length > 0
      ? lastBefore[lastBefore.length - 1].to
      : (boundaries[0]?.from ?? periodWithoutBoundaries);
  const insideBoundaries = boundaries.filter(
    ({ instant }) =>
      instant.epochMilliseconds > spanStart &&
      instant.epochMilliseconds < spanEnd,
  );
  const shares = new Map<DayPeriod, number>();
  let segmentStart = spanStart;
  let segmentPeriod = periodAtStart;
  for (const boundary of insideBoundaries) {
    const instant = boundary.instant.epochMilliseconds;
    shares.set(
      segmentPeriod,
      (shares.get(segmentPeriod) ?? 0) + instant - segmentStart,
    );
    segmentStart = instant;
    segmentPeriod = boundary.to;
  }
  shares.set(
    segmentPeriod,
    (shares.get(segmentPeriod) ?? 0) + spanEnd - segmentStart,
  );
  let largest = periodAtStart;
  let largestShare = -1;
  for (const [period, share] of shares) {
    if (share > largestShare) {
      largest = period;
      largestShare = share;
    }
  }
  return largest;
}
