// Verifies FR8 of add-grid-meeting-range-and-share.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getLocationMeetingRange } from "./locationMeetingRange";
import type { MeetingRange } from "./meetingRange";

const ALMATY = "Asia/Almaty";
const at = (time: string) => Temporal.Instant.from(`2026-03-08T${time}:00Z`);
const SAMPLE: MeetingRange = { start: at("04:00"), end: at("06:00") };

describe("getLocationMeetingRange", () => {
  it("should read the local span and day shift of New York", () => {
    const local = getLocationMeetingRange("America/New_York", SAMPLE, ALMATY);
    expect(local.localStart.toPlainTime().toString()).toBe("23:00:00");
    expect(local.localEnd.toPlainTime().toString()).toBe("01:00:00");
    expect(local.dayShift).toBe("EARLIER");
  });
});
