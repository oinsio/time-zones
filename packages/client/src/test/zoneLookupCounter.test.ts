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
});
