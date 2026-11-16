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
  const instantOf = (boundary: DayPeriodBoundary) =>
    boundary.instant.epochMilliseconds;
  const passed = boundaries.filter(
    (boundary) => instantOf(boundary) <= spanStart,
  );
  let period = passed.length
    ? passed[passed.length - 1].to
    : (boundaries[0]?.from ?? periodWithoutBoundaries);
  const shares = new Map<DayPeriod, number>();
  let segmentStart = spanStart;
  const addShare = (segmentEnd: number) =>
    shares.set(period, (shares.get(period) ?? 0) + segmentEnd - segmentStart);
  for (const boundary of boundaries) {
    const instant = instantOf(boundary);
    if (instant <= spanStart || instant >= spanEnd) continue;
    addShare(instant);
    segmentStart = instant;
    period = boundary.to;
  }
  addShare(spanEnd);
  return [...shares].reduce((largest, share) =>
    share[1] > largest[1] ? share : largest,
  )[0];
}
