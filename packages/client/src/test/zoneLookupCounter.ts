// Implements NFR-P1 of set-home-location-and-show-differences (D4).
// Counts the time zone lookups our code asks for, per zone, so the reference
// offset can be shown to be read once per presentation and not once per row.
// Implements NFR-P1 of add-wall-time-input-with-hint (D1): also counts the
// conversions of a wall-clock time to an instant, per zone.
// Implements NFR-P1 of show-zone-abbreviations-and-zone-label-setting (D2): also
// counts the adjustments (`with`) of a zoned date-time, per zone.
import { vi } from "vitest";
import { Temporal } from "@/lib/temporal";

export type ZoneLookupCount = {
  lookupsIn(timeZoneId: string): number;
  wallClockLookupsIn(timeZoneId: string): number;
  adjustmentsIn(timeZoneId: string): number;
  stop(): void;
};

const countIn = (counts: Map<string, number>, timeZone: unknown) => {
  const timeZoneId = String(timeZone);
  counts.set(timeZoneId, (counts.get(timeZoneId) ?? 0) + 1);
};

export function startZoneLookupCount(): ZoneLookupCount {
  const lookupsByZone = new Map<string, number>();
  const wallClockLookupsByZone = new Map<string, number>();
  const original = Temporal.Instant.prototype.toZonedDateTimeISO;
  const originalWallClock = Temporal.PlainDateTime.prototype.toZonedDateTime;
  const adjustmentsByZone = new Map<string, number>();
  const originalWith = Temporal.ZonedDateTime.prototype.with;
  const spy = vi
    .spyOn(Temporal.Instant.prototype, "toZonedDateTimeISO")
    .mockImplementation(function (this: Temporal.Instant, timeZone) {
      countIn(lookupsByZone, timeZone);
      return original.call(this, timeZone);
    });
  const wallClockSpy = vi
    .spyOn(Temporal.PlainDateTime.prototype, "toZonedDateTime")
    .mockImplementation(function (
      this: Temporal.PlainDateTime,
      timeZone,
      options,
    ) {
      countIn(wallClockLookupsByZone, timeZone);
      return originalWallClock.call(this, timeZone, options);
    });
  const adjustmentSpy = vi
    .spyOn(Temporal.ZonedDateTime.prototype, "with")
    .mockImplementation(function (
      this: Temporal.ZonedDateTime,
      fields,
      options,
    ) {
      countIn(adjustmentsByZone, this.timeZoneId);
      return originalWith.call(this, fields, options);
    });
  return {
    lookupsIn: (timeZoneId) => lookupsByZone.get(timeZoneId) ?? 0,
    wallClockLookupsIn: (timeZoneId) =>
      wallClockLookupsByZone.get(timeZoneId) ?? 0,
    adjustmentsIn: (timeZoneId) => adjustmentsByZone.get(timeZoneId) ?? 0,
    stop: () => {
      spy.mockRestore();
      wallClockSpy.mockRestore();
      adjustmentSpy.mockRestore();
    },
  };
}
