// Verifies FR4, FR7, FR9 of select-date-with-calendar-and-now (D4).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import { HourFormat } from "@/preferences";
import { presentDateBar } from "./dateBar";

const present = (
  effectiveDate: string,
  language: InterfaceLanguageCode = "en",
  overrides: Partial<Parameters<typeof presentDateBar>[0]> = {},
) =>
  presentDateBar({
    effectiveDate: Temporal.PlainDate.from(effectiveDate),
    today: Temporal.PlainDate.from("2026-03-08"),
    isPinned: false,
    gap: undefined,
    language,
    hourFormat: HourFormat.H24,
    translate: i18n.getFixedT(language),
    ...overrides,
  });

describe("presentDateBar", () => {
  it.each([
    ["en", "2026-03-08", "Sun, March 8", "Sunday, March 8"],
    ["ru", "2026-03-08", "вс, 8 марта", "воскресенье, 8 марта"],
    ["en", "2027-03-08", "Mon, March 8, 2027", "Monday, March 8, 2027"],
  ] as const)(
    "should write %s %s as %s and %s",
    (language, date, shortLabel, longLabel) => {
      const bar = present(date, language);

      expect(bar.shortLabel).toBe(shortLabel);
      expect(bar.longLabel).toBe(longLabel);
    },
  );

  it("should give the ISO date, the full date and the choose label", () => {
    const bar = present("2026-03-08");

    expect(bar.isoDate).toBe("2026-03-08");
    expect(bar.fullDateLabel).toBe("Sunday, March 8, 2026");
    expect(bar.chooseDateLabel).toBe("Choose date, Sunday, March 8, 2026");
  });

  it.each([true, false])("should pass isPinned %s through", (isPinned) => {
    expect(present("2026-03-08", "en", { isPinned }).isPinned).toBe(isPinned);
  });

  it.each([
    [
      "en",
      "02:30 does not exist on this day because of a clock change; showing 03:30.",
    ],
    ["ru", "02:30 в этот день нет из-за перевода часов; показано 03:30."],
  ] as const)("should tell a gap in %s", (language, expected) => {
    const bar = present("2026-03-08", language, {
      gap: {
        requestedWallTime: Temporal.PlainTime.from("02:30"),
        shownWallTime: Temporal.PlainTime.from("03:30"),
      },
    });

    expect(bar.gapNote).toBe(expected);
  });

  it("should give no note without a gap", () => {
    expect(present("2026-03-08").gapNote).toBeUndefined();
  });
});

// Verifies FR5 of add-settings-page-and-device-time-location (D8).
describe("presentDateBar gap note in the 12-hour format", () => {
  it("should write both times with a day period", () => {
    const { gapNote } = present("2026-03-08", "en", {
      hourFormat: HourFormat.H12,
      gap: {
        requestedWallTime: Temporal.PlainTime.from("02:30"),
        shownWallTime: Temporal.PlainTime.from("03:30"),
      },
    });
    const normalizedNote = gapNote?.replace(/\s/g, " ");
    expect(normalizedNote).toContain("2:30 AM");
    expect(normalizedNote).toContain("3:30 AM");
  });
});
