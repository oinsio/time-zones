// Verifies FR4 of show-clock-change-note-on-location-cards (D2, D3).
import { type MockInstance, vi } from "vitest";
import { Temporal } from "@/lib/temporal";

const NANOSECONDS_PER_TEST_MINUTE = 60_000_000_000;

export type StubbedZoneRules = {
  initialOffsetMinutes: number;
  changes: ReadonlyArray<{ instant: string; offsetMinutesAfter: number }>;
};

/**
 * Gives one zone the stated offset changes in the transition walk and in the
 * offset of its zoned values. The polyfill reads rules in 60-day periods and
 * misses a daylight saving span shorter than one (America/Boa_Vista, October
 * 2000), so a test of two changes within days of each other states the real
 * rules itself. Restore with `mockRestore()` of each returned spy.
 */
export function stubZoneRules(
  timeZoneId: string,
  rules: StubbedZoneRules,
): MockInstance[] {
  const changes = rules.changes.map((change) => ({
    instant: Temporal.Instant.from(change.instant),
    offsetMinutesAfter: change.offsetMinutesAfter,
  }));
  const prototype = Temporal.ZonedDateTime.prototype;
  const originalGetTimeZoneTransition = prototype.getTimeZoneTransition;
  const originalOffsetNanoseconds = Object.getOwnPropertyDescriptor(
    prototype,
    "offsetNanoseconds",
  )?.get as (this: Temporal.ZonedDateTime) => number;
  const transitionSpy = vi
    .spyOn(prototype, "getTimeZoneTransition")
    .mockImplementation(function (this: Temporal.ZonedDateTime, ...args) {
      if (this.timeZoneId !== timeZoneId) {
        return originalGetTimeZoneTransition.apply(this, args);
      }
      const next = changes.find(
        (change) =>
          Temporal.Instant.compare(change.instant, this.toInstant()) > 0,
      );
      return next === undefined
        ? null
        : next.instant.toZonedDateTimeISO(timeZoneId);
    });
  const offsetSpy = vi
    .spyOn(prototype, "offsetNanoseconds", "get")
    .mockImplementation(function (this: Temporal.ZonedDateTime) {
      if (this.timeZoneId !== timeZoneId) {
        return originalOffsetNanoseconds.call(this);
      }
      const passed = changes.filter(
        (change) =>
          Temporal.Instant.compare(change.instant, this.toInstant()) <= 0,
      );
      const offsetMinutes =
        passed.at(-1)?.offsetMinutesAfter ?? rules.initialOffsetMinutes;
      return offsetMinutes * NANOSECONDS_PER_TEST_MINUTE;
    });
  return [transitionSpy, offsetSpy];
}
