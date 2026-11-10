// Verifies FR14, FR16, UX3 of add-grid-meeting-range-and-share.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { presentMeetingShareText } from "./meetingShareText";

const rows = [
  { cityLabel: "Almaty", spanLabel: "09:00–11:00" },
  { cityLabel: "Moscow", spanLabel: "07:00–09:00" },
  { cityLabel: "Kolkata", spanLabel: "09:30–11:30" },
  {
    cityLabel: "New York",
    spanLabel: "23:00–01:00",
    dayShiftLabel: "a day earlier",
    localDateLabel: "Sat, Mar 7",
  },
];

describe("presentMeetingShareText", () => {
  it("should write the five English lines of the sample meeting", () => {
    const text = presentMeetingShareText({
      fullDateLabel: "Sunday, March 8, 2026",
      durationLabel: "2 h",
      rows,
      translate: i18n.getFixedT("en"),
    });

    expect(text.split("\n")).toEqual([
      "Meeting on Sunday, March 8, 2026, 2 h",
      "Almaty: 09:00–11:00",
      "Moscow: 07:00–09:00",
      "Kolkata: 09:30–11:30",
      "New York: 23:00–01:00 (a day earlier, Sat, Mar 7)",
    ]);
  });

  it("should write the Russian heading", () => {
    const text = presentMeetingShareText({
      fullDateLabel: "воскресенье, 8 марта 2026 г.",
      durationLabel: "2 ч",
      rows: rows.slice(0, 1),
      translate: i18n.getFixedT("ru"),
    });

    expect(text).toBe(
      "Встреча воскресенье, 8 марта 2026 г., 2 ч\nAlmaty: 09:00–11:00",
    );
  });

  it("should hold no link", () => {
    const text = presentMeetingShareText({
      fullDateLabel: "Sunday, March 8, 2026",
      durationLabel: "2 h",
      rows,
      translate: i18n.getFixedT("en"),
    });
    expect(text).not.toMatch(/https?:/);
  });
});
