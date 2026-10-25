// Verifies FR3 of show-local-time-and-date-on-location-cards (D4).
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { getMillisecondsUntilNextMinute } from "./minuteBoundary";

describe("getMillisecondsUntilNextMinute", () => {
  it.each([
    ["2026-07-15T12:00:42.500Z", 17_500],
    ["2026-07-15T12:01:00.000Z", 60_000],
    ["2026-07-15T12:00:59.999Z", 1],
  ])("should give %s a wait of %i ms", (timestamp, expectedDelayMs) => {
    expect(getMillisecondsUntilNextMinute(fakeClock(timestamp).instant())).toBe(
      expectedDelayMs,
    );
  });
});
