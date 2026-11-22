// Verifies FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay } from "./dayTrack";
import { getHourFrameIndex } from "./hourCellColumns";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";

const ALMATY = "Asia/Almaty";
const SAMPLE_INSTANT = Temporal.Instant.from("2026-03-08T07:30:00Z");

const ALMATY_DAY = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: ALMATY },
  SAMPLE_INSTANT,
);

describe("getHourFrameIndex", () => {
  it.each([
    ["2026-03-08T07:30:00Z", 12],
    ["2026-03-08T08:00:00Z", 13],
    ["2026-03-07T19:00:00Z", 0],
    ["2026-03-08T18:59:00Z", 23],
  ])("should put %s in column %i", (instant, column) => {
    expect(getHourFrameIndex(ALMATY_DAY, Temporal.Instant.from(instant))).toBe(
      column,
    );
  });

  it("should clamp an instant before the day to column 0", () => {
    expect(
      getHourFrameIndex(
        ALMATY_DAY,
        Temporal.Instant.from("2026-03-07T10:00:00Z"),
      ),
    ).toBe(0);
  });

  it("should clamp an instant after the day to the last column", () => {
    expect(
      getHourFrameIndex(
        ALMATY_DAY,
        Temporal.Instant.from("2026-03-10T10:00:00Z"),
      ),
    ).toBe(23);
  });
});
