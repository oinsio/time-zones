// Verifies FR7, FR11 of add-wall-time-input-with-hint (D4).
// Verifies FR7 of show-zone-abbreviations-and-zone-label-setting (D5).

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
  zone: {
    zoneAbbreviationLabel?: string;
    isZoneAbbreviationShown?: boolean;
  } = {},
) =>
  presentWallTimeHint({
    status,
    requestedWallTime: Temporal.PlainTime.from(requested),
    shownTimeLabel: "03:30",
    utcOffsetLabel: "UTC−4",
    zoneAbbreviationLabel: zone.zoneAbbreviationLabel ?? "",
    isZoneAbbreviationShown: zone.isZoneAbbreviationShown ?? false,
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

  it.each([
    ["en", "01:30 occurs twice — showing the first (EDT, UTC−4)."],
    ["ru", "01:30 бывает дважды — показано первое (EDT, UTC−4)"],
  ] as const)(
    "names the abbreviation before the offset in %s",
    (language, expected) => {
      const hint = hintFor(language, WallClockStatus.AMBIGUOUS, "01:30", {
        zoneAbbreviationLabel: "EDT",
        isZoneAbbreviationShown: true,
      });
      expect(hint).toBe(expected);
    },
  );

  it.each([
    [
      "the abbreviation is hidden",
      { zoneAbbreviationLabel: "EDT", isZoneAbbreviationShown: false },
    ],
    [
      "the zone has no abbreviation",
      { zoneAbbreviationLabel: "", isZoneAbbreviationShown: true },
    ],
  ])("names only the offset when %s", (_name, zone) => {
    expect(hintFor("en", WallClockStatus.AMBIGUOUS, "01:30", zone)).toBe(
      "01:30 occurs twice — showing the first (UTC−4).",
    );
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
      zoneAbbreviationLabel: "",
      isZoneAbbreviationShown: false,
      language: "en",
      hourFormat: HourFormat.H12,
      translate: i18n.getFixedT("en"),
    });
    expect(hint?.replace(/\s/g, " ")).toContain("2:30 AM does not exist");
  });
});
