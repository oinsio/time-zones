// Verifies NFR-P1 of set-home-location-and-show-differences (D4): the lookup counter.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { startZoneLookupCount } from "./zoneLookupCounter";

describe("startZoneLookupCount", () => {
  it("should count lookups per zone and stop counting", () => {
    const instant = Temporal.Instant.from("2026-03-08T07:30:00Z");
    const count = startZoneLookupCount();

    instant.toZonedDateTimeISO("Asia/Almaty");
    instant.toZonedDateTimeISO("Asia/Almaty");
    instant.toZonedDateTimeISO("Europe/Moscow");
    count.stop();
    instant.toZonedDateTimeISO("Asia/Almaty");

    expect(count.lookupsIn("Asia/Almaty")).toBe(2);
    expect(count.lookupsIn("Europe/Moscow")).toBe(1);
    expect(count.lookupsIn("Asia/Tokyo")).toBe(0);
  });

  // Verifies NFR-P1 of add-wall-time-input-with-hint (D1): wall-clock lookups.
  it("should count wall-clock time conversions per zone and stop counting", () => {
    const wallClock = Temporal.PlainDateTime.from("2026-03-08T02:30:00");
    const count = startZoneLookupCount();

    wallClock.toZonedDateTime("America/New_York");
    wallClock.toZonedDateTime("America/New_York", {
      disambiguation: "later",
    });
    count.stop();
    wallClock.toZonedDateTime("America/New_York");

    expect(count.wallClockLookupsIn("America/New_York")).toBe(2);
    expect(count.wallClockLookupsIn("Europe/Moscow")).toBe(0);
  });
});

// Verifies NFR-P1 of show-zone-abbreviations-and-zone-label-setting (D2): adjustments per zone.
describe("startZoneLookupCount adjustments", () => {
  it("should count adjustments of a zoned date-time per zone and leave the lookups alone", () => {
    const zoned = Temporal.ZonedDateTime.from(
      "2026-03-07T07:30:00-05:00[America/New_York]",
    );
    const count = startZoneLookupCount();

    zoned.with({ hour: 1 });
    zoned.with({ hour: 2 });
    count.stop();
    zoned.with({ hour: 3 });

    expect(count.adjustmentsIn("America/New_York")).toBe(2);
    expect(count.adjustmentsIn("Europe/Moscow")).toBe(0);
    expect(count.lookupsIn("America/New_York")).toBe(0);
  });
});
