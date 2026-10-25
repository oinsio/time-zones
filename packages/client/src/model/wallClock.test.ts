// Verifies FR4 of select-date-with-calendar-and-now (D2).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { resolveWallClock, WallClockStatus } from "./wallClock";

describe("resolveWallClock", () => {
  const rows = [
    [
      "America/New_York",
      "2026-06-02T10:00",
      "2026-06-02T14:00:00Z",
      WallClockStatus.UNIQUE,
    ],
    [
      "America/New_York",
      "2026-03-08T02:30",
      "2026-03-08T07:30:00Z",
      WallClockStatus.GAP,
    ],
    [
      "America/New_York",
      "2026-11-01T01:30",
      "2026-11-01T05:30:00Z",
      WallClockStatus.AMBIGUOUS,
    ],
    [
      "Asia/Almaty",
      "2026-03-09T12:30",
      "2026-03-09T07:30:00Z",
      WallClockStatus.UNIQUE,
    ],
  ] as const;

  it.each(rows)(
    "should resolve %s %s to %s as %s",
    (zone, wallTime, expectedInstant, expectedStatus) => {
      const resolved = resolveWallClock(
        zone,
        Temporal.PlainDateTime.from(wallTime),
      );

      expect(resolved.instant.toString()).toBe(expectedInstant);
      expect(resolved.status).toBe(expectedStatus);
    },
  );

  it.each(rows)(
    "should pick the compatible instant for %s %s",
    (zone, wallTime) => {
      const plainDateTime = Temporal.PlainDateTime.from(wallTime);

      const resolved = resolveWallClock(zone, plainDateTime);

      expect(
        resolved.instant.equals(
          plainDateTime
            .toZonedDateTime(zone, { disambiguation: "compatible" })
            .toInstant(),
        ),
      ).toBe(true);
    },
  );
});
