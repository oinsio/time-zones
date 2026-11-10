// Verifies FR13 of add-grid-meeting-range-and-share.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { formatMeetingDuration, presentMeetingBar } from "./meetingBar";

describe("presentMeetingBar", () => {
  it.each([
    ["ru", 120, "Встреча · 2 ч"],
    ["ru", 105, "Встреча · 1 ч 45 мин"],
    ["ru", 45, "Встреча · 45 мин"],
    ["en", 120, "Meeting · 2 h"],
    ["en", 105, "Meeting · 1 h 45 min"],
  ] as const)(
    "should title %s %i minutes as %s",
    (language, minutes, title) => {
      expect(presentMeetingBar(minutes, i18n.getFixedT(language)).title).toBe(
        title,
      );
    },
  );

  it("should name the buttons", () => {
    const bar = presentMeetingBar(60, i18n.getFixedT("ru"));
    expect([bar.shareLabel, bar.clearLabel]).toEqual([
      "Поделиться встречей",
      "Сбросить выбор встречи",
    ]);
  });
});

describe("formatMeetingDuration", () => {
  it("should write a day of 24 hours", () => {
    expect(formatMeetingDuration(1440, i18n.getFixedT("en"))).toBe("24 h");
  });
});
