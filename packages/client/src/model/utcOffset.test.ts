import { describe, expect, it } from "vitest";
import { fakeClock, type Temporal } from "@/lib/temporal";
import { getUtcOffsetMinutes } from "./utcOffset";

const july = fakeClock("2026-07-15T12:00:00Z").instant();
const january = fakeClock("2026-01-15T12:00:00Z").instant();

describe("getUtcOffsetMinutes", () => {
  // FR2: offset comes from the IANA id for the given instant
  it.each([
    ["Europe/Moscow", july, 180],
    ["Asia/Kolkata", july, 330],
    ["Asia/Kathmandu", july, 345],
    ["America/New_York", july, -240],
    ["America/New_York", january, -300],
    ["UTC", july, 0],
  ])(
    "should return the offset of %s as %i minutes",
    (zone, instant, minutes) => {
      expect(getUtcOffsetMinutes(zone, instant)).toBe(minutes);
    },
  );

  // FR6: an unknown zone yields undefined, not an exception
  it("should return undefined for an unknown time zone", () => {
    expect(getUtcOffsetMinutes("Mars/Olympus_Mons", july)).toBeUndefined();
  });

  it("should not hide an unexpected failure", () => {
    const failingInstant = {
      toZonedDateTimeISO: () => {
        throw new TypeError("unexpected");
      },
    } as unknown as Temporal.Instant;
    expect(() => getUtcOffsetMinutes("UTC", failingInstant)).toThrow(TypeError);
  });
});
