// Implements NFR-P1 of set-home-location-and-show-differences (D4).
// Counts the time zone lookups our code asks for, per zone, so the reference
// offset can be shown to be read once per presentation and not once per row.
import { vi } from "vitest";
import { Temporal } from "@/lib/temporal";

export type ZoneLookupCount = {
  lookupsIn(timeZoneId: string): number;
  stop(): void;
};

export function startZoneLookupCount(): ZoneLookupCount {
  const lookupsByZone = new Map<string, number>();
  const original = Temporal.Instant.prototype.toZonedDateTimeISO;
  const spy = vi
    .spyOn(Temporal.Instant.prototype, "toZonedDateTimeISO")
    .mockImplementation(function (this: Temporal.Instant, timeZone) {
      const timeZoneId = String(timeZone);
      lookupsByZone.set(timeZoneId, (lookupsByZone.get(timeZoneId) ?? 0) + 1);
      return original.call(this, timeZone);
    });
  return {
    lookupsIn: (timeZoneId) => lookupsByZone.get(timeZoneId) ?? 0,
    stop: () => spy.mockRestore(),
  };
}
