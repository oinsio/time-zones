// Verifies FR16 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getMinuteStart } from "./minuteStart";

describe("getMinuteStart", () => {
  it.each([
    [1_795_432_987_654, 1_795_432_980_000],
    [1_795_432_980_000, 1_795_432_980_000],
    [-1, -60_000],
    [-60_001, -120_000],
  ])("drops the seconds of %i ms", (epochMilliseconds, expected) => {
    const instant = Temporal.Instant.fromEpochMilliseconds(epochMilliseconds);
    expect(getMinuteStart(instant).epochMilliseconds).toBe(expected);
  });
});
