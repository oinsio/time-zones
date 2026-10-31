// Verifies FR7, FR11 of add-wall-time-input-with-hint (D4).

import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { WallClockStatus } from "@/model";
import { HourFormat } from "@/preferences";
import { presentWallTimeHint } from "./wallTimeHint";

const hintFor = (
  language: "en" | "ru",
  status: WallClockStatus,
  requested: string,
) =>
  presentWallTimeHint({
    status,
    requestedWallTime: Temporal.PlainTime.from(requested),
    shownTimeLabel: "03:30",
    utcOffsetLabel: "UTC−4",
    language,
    hourFormat: HourFormat.H24,
    translate: i18n.getFixedT(language),
  });

describe("presentWallTimeHint", () => {
  it.each([
    [
      "en",
      WallClockStatus.GAP,
      "02:30",
      "02:30 does not exist on this day — clocks moved forward. Showing 03:30.",
    ],
    [
      "ru",
      WallClockStatus.GAP,
      "02:30",
      "02:30 не существует в этот день — часы переведены вперёд. Показано 03:30",
    ],
    [
      "en",
      WallClockStatus.AMBIGUOUS,
      "01:30",
      "01:30 occurs twice — showing the first (UTC−4).",
    ],
    [
      "ru",
      WallClockStatus.AMBIGUOUS,
      "01:30",
      "01:30 бывает дважды — показано первое (UTC−4)",
    ],
  ] as const)("writes %s %s %s", (language, status, requested, expected) => {
    expect(hintFor(language, status, requested)).toBe(expected);
  });

  it("writes no hint for a UNIQUE time", () => {
    expect(hintFor("en", WallClockStatus.UNIQUE, "10:40")).toBeUndefined();
  });
});

// Verifies FR5 of add-settings-page-and-device-time-location (D8).
describe("presentWallTimeHint in the 12-hour format", () => {
  it("should write the requested time with a day period", () => {
    const hint = presentWallTimeHint({
      status: WallClockStatus.GAP,
      requestedWallTime: Temporal.PlainTime.from("02:30"),
      shownTimeLabel: "3:30 AM",
      utcOffsetLabel: "UTC−4",
      language: "en",
      hourFormat: HourFormat.H12,
      translate: i18n.getFixedT("en"),
    });
    expect(hint?.replace(/\s/g, " ")).toContain("2:30 AM does not exist");
  });
});
