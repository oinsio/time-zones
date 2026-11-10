// Verifies FR8 of add-grid-meeting-range-and-share.
// Verifies FR3 of fix-grid-meeting-range-lock-and-layering.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import { formatLocalTime } from "./localDateTime";
import { presentLocationMeetingRange } from "./locationMeetingRange";

const MEETING = {
  start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
  end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
};
const present = (
  timeZoneId: string,
  hourFormat: HourFormat = HourFormat.H24,
  language: "en" | "ru" = "ru",
) =>
  presentLocationMeetingRange(timeZoneId, MEETING, "Asia/Almaty", {
    language,
    hourFormat,
    translate: i18n.getFixedT(language),
  });

describe("presentLocationMeetingRange", () => {
  it.each([
    ["Asia/Almaty", "09:00–11:00"],
    ["Europe/Moscow", "07:00–09:00"],
    ["Asia/Kolkata", "09:30–11:30"],
    ["America/New_York", "23:00–01:00"],
  ])("should write the span of %s as %s", (timeZoneId, span) => {
    expect(present(timeZoneId).spanLabel).toBe(span);
  });

  it.each([
    ["Asia/Almaty", "09:00", "11:00"],
    ["Europe/Moscow", "07:00", "09:00"],
    ["Asia/Kolkata", "09:30", "11:30"],
    ["America/New_York", "23:00", "01:00"],
  ])(
    "should give the start and end labels of %s as %s and %s",
    (timeZoneId, startTimeLabel, endTimeLabel) => {
      const presented = present(timeZoneId);
      expect(presented.startTimeLabel).toBe(startTimeLabel);
      expect(presented.endTimeLabel).toBe(endTimeLabel);
      expect(presented.spanLabel).toBe(`${startTimeLabel}–${endTimeLabel}`);
    },
  );

  it("should label New York a day earlier", () => {
    expect(present("America/New_York").dayShiftLabel).toBe("днём раньше");
  });

  it("should label a later day", () => {
    const later = presentLocationMeetingRange(
      "Pacific/Auckland",
      {
        start: MEETING.start.add({ hours: 8 }),
        end: MEETING.end.add({ hours: 8 }),
      },
      "Asia/Almaty",
      {
        language: "en",
        hourFormat: HourFormat.H24,
        translate: i18n.getFixedT("en"),
      },
    );
    expect(later.dayShiftLabel).toBe("a day later");
  });

  it("should give no label for the same day", () => {
    expect(present("Europe/Moscow").dayShiftLabel).toBeUndefined();
  });

  it("should write the 12-hour span with the time formatter", () => {
    const expected = ["Asia/Almaty"].map((zone) => {
      const format = (instant: Temporal.Instant) =>
        formatLocalTime(instant.toZonedDateTimeISO(zone), "en", HourFormat.H12);
      return `${format(MEETING.start)}–${format(MEETING.end)}`;
    })[0];
    expect(present("Asia/Almaty", HourFormat.H12, "en").spanLabel).toBe(
      expected,
    );
  });
});
