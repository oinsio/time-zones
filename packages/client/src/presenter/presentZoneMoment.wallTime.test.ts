// Verifies FR7, NFR-A2 of add-wall-time-input-with-hint (D4).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { fakeClock, Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  buildDeviceTimeLocation,
  getUtcOffsetMinutes,
  LocationKind,
  type WallClockNote,
  WallClockNotePlacement,
  WallClockStatus,
  WallTimeTargetKind,
} from "@/model";
import { HourFormat } from "@/preferences";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentLocationRows } from "./presentLocationRows";
import type { LocationRowsContext } from "./presentZoneMoment";

const MOSCOW = {
  id: "Europe/Moscow|Moscow",
  kind: LocationKind.CITY,
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};
const NEW_YORK = {
  id: "America/New_York|New York",
  kind: LocationKind.CITY,
  timeZoneId: "America/New_York",
  label: "New York",
  countryCode: "US",
};
const DEVICE_TIME = buildDeviceTimeLocation("Asia/Almaty");
const instant = fakeClock("2026-03-08T07:30:00Z").instant();

const contextOf = (
  language: InterfaceLanguageCode,
  wallClockNote?: WallClockNote,
): LocationRowsContext => ({
  language,
  hourFormat: HourFormat.H24,
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

  it("names the device time location by its exemplar city", () => {
    const [row] = presentLocationRows([DEVICE_TIME], {
      ...contextOf("en"),
      deviceTimeCityLabel: "Almaty",
    });
    expect(row?.wallTimeInputLabel).toBe("Enter time — Almaty, 12:30");
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

  it("shows on the device time location for its target, not on other locations", () => {
    const deviceTimeNote: WallClockNote = {
      ...newYorkGap,
      target: {
        kind: WallTimeTargetKind.LOCATION,
        locationId: DEVICE_TIME_LOCATION_ID,
      },
    };
    const rows = presentLocationRows(
      [buildDeviceTimeLocation("America/New_York"), NEW_YORK],
      contextOf("en", deviceTimeNote),
    );
    expect(rows[0]?.wallTimeHint).toContain("02:30 does not exist");
    expect(rows[1]?.wallTimeHint).toBeUndefined();
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
