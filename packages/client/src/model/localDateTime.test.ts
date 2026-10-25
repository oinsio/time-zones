// Verifies FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D1).
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { getLocalDateTime } from "./localDateTime";

const instantOf = (isoTimestamp: string) => fakeClock(isoTimestamp).instant();

describe("getLocalDateTime", () => {
  it.each([
    ["Asia/Almaty", "2026-03-08T07:30:00Z", "2026-03-08T12:30:00"],
    ["Asia/Kathmandu", "2026-03-08T07:30:00Z", "2026-03-08T13:15:00"],
    ["America/New_York", "2026-03-08T06:30:00Z", "2026-03-08T01:30:00"],
    ["America/New_York", "2026-03-08T07:30:00Z", "2026-03-08T03:30:00"],
    ["Asia/Tokyo", "2026-03-08T16:00:00Z", "2026-03-09T01:00:00"],
  ])("should give %s at %s the wall time %s", (zone, timestamp, wallTime) => {
    const localDateTime = getLocalDateTime(zone, instantOf(timestamp));
    expect(localDateTime?.toPlainDateTime().toString()).toBe(wallTime);
  });

  it("should give the plain date of the zone, not of UTC", () => {
    const localDateTime = getLocalDateTime(
      "Asia/Tokyo",
      instantOf("2026-03-08T16:00:00Z"),
    );
    expect(localDateTime?.toPlainDate().toString()).toBe("2026-03-09");
  });

  it("should return undefined for an unknown time zone", () => {
    expect(
      getLocalDateTime("Mars/Olympus_Mons", instantOf("2026-03-08T07:30:00Z")),
    ).toBeUndefined();
  });

  it("should not hide an unexpected failure", () => {
    const failingInstant = {
      toZonedDateTimeISO: () => {
        throw new TypeError("boom");
      },
    } as never;
    expect(() => getLocalDateTime("UTC", failingInstant)).toThrow(TypeError);
  });
});
