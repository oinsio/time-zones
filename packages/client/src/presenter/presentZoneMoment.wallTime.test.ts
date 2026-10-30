// Verifies FR7, NFR-A2 of add-wall-time-input-with-hint (D4).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock, Temporal } from "@/lib/temporal";
import {
  getUtcOffsetMinutes,
  type WallClockNote,
  WallClockNotePlacement,
  WallClockStatus,
  WallTimeTargetKind,
} from "@/model";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentHereEntry } from "./presentHereEntry";
import { presentLocationRows } from "./presentLocationRows";
import type { LocationRowsContext } from "./presentZoneMoment";

const MOSCOW = {
  id: "Europe/Moscow|Moscow",
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};
const NEW_YORK = {
  id: "America/New_York|New York",
  timeZoneId: "America/New_York",
  label: "New York",
  countryCode: "US",
};
const instant = fakeClock("2026-03-08T07:30:00Z").instant();

const contextOf = (
  language: SupportedLanguage,
  wallClockNote?: WallClockNote,
): LocationRowsContext => ({
  language,
  instant,
  translate: i18n.getFixedT(language),
  deviceTimeZoneId: "Asia/Almaty",
  homeLocationId: null,
  referenceOffsetMinutes: getUtcOffsetMinutes("Asia/Almaty", instant),
  referenceDay: buildReferenceDay(instant, "Asia/Almaty"),
  wallClockNote,
});
const newYorkGap: WallClockNote = {
  placement: WallClockNotePlacement.ROW,
  target: { kind: WallTimeTargetKind.LOCATION, locationId: NEW_YORK.id },
  status: WallClockStatus.GAP,
  requestedWallTime: Temporal.PlainTime.from("02:30"),
};

describe("the wall-time input name", () => {
  it.each([
    ["en", "Enter time — Moscow, 10:30"],
    ["ru", "Ввести время — Moscow, 10:30"],
  ] as const)(
    "is written in %s with the city and the time",
    (language, expected) => {
      const [row] = presentLocationRows([MOSCOW], contextOf(language));
      expect(row?.wallTimeInputLabel).toBe(expected);
    },
  );

  it("names the Here entry by its city", () => {
    const presented = presentHereEntry(
      { timeZoneId: "Asia/Almaty" },
      "Almaty",
      contextOf("en"),
    );
    expect(presented.wallTimeInputLabel).toBe("Enter time — Almaty, 12:30");
  });
});

describe("the wall-time hint", () => {
  it("shows only on the location the note names", () => {
    const rows = presentLocationRows(
      [MOSCOW, NEW_YORK],
      contextOf("en", newYorkGap),
    );
    expect(rows.map((row) => row.wallTimeHint !== undefined)).toEqual([
      false,
      true,
    ]);
    expect(rows[1]?.wallTimeHint).toBe(
      "02:30 does not exist on this day — clocks moved forward. Showing 03:30.",
    );
  });

  it("shows on the Here entry for a Here entry target, not on locations", () => {
    const hereNote: WallClockNote = {
      ...newYorkGap,
      target: { kind: WallTimeTargetKind.HERE_ENTRY },
    };
    const context = contextOf("en", hereNote);
    expect(
      presentHereEntry({ timeZoneId: "America/New_York" }, "New York", context)
        .wallTimeHint,
    ).toContain("02:30 does not exist");
    expect(presentLocationRows([NEW_YORK], context)[0]?.wallTimeHint).toBe(
      undefined,
    );
  });

  it("shows no hint on the Here entry for a location target", () => {
    expect(
      presentHereEntry(
        { timeZoneId: "America/New_York" },
        "New York",
        contextOf("en", newYorkGap),
      ).wallTimeHint,
    ).toBeUndefined();
  });

  it.each([
    ["no note", undefined],
    ["a none note", { placement: WallClockNotePlacement.NONE }],
    [
      "a date bar note",
      {
        placement: WallClockNotePlacement.DATE_BAR,
        requestedWallTime: Temporal.PlainTime.from("02:30"),
      },
    ],
  ] as const)("is absent for %s", (_name, note) => {
    const [row] = presentLocationRows([NEW_YORK], contextOf("en", note));
    expect(row?.wallTimeHint).toBeUndefined();
  });
});
