// Verifies FR12 of add-grid-meeting-range-and-share.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentMeetingHandles } from "./meetingHandles";

const day = buildReferenceDay(
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
  "Asia/Almaty",
);
const MEETING = {
  start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
  end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
};
const present = (language: "en" | "ru" = "en", hourFormat = HourFormat.H24) =>
  presentMeetingHandles(day, MEETING, "Asia/Almaty", {
    language,
    hourFormat,
    translate: i18n.getFixedT(language),
  });

describe("presentMeetingHandles", () => {
  it("should name the handles", () => {
    expect([present("en").start.label, present("en").end.label]).toEqual([
      "Meeting start",
      "Meeting end",
    ]);
    expect(present("ru").start.label).toBe("Начало встречи");
  });

  it("should give the values and limits in minutes", () => {
    const { start, end } = present();
    expect([start.valueMinutes, start.minMinutes, start.maxMinutes]).toEqual([
      540, 0, 645,
    ]);
    expect([end.valueMinutes, end.minMinutes, end.maxMinutes]).toEqual([
      660, 555, 1440,
    ]);
  });

  it("should write the value texts as local times of the reference zone", () => {
    const { start, end } = present();
    expect([start.valueText, end.valueText]).toEqual(["09:00", "11:00"]);
  });

  it("should follow the hour format", () => {
    expect(present("en", HourFormat.H12).start.valueText).toMatch(/9:00/);
  });
});
