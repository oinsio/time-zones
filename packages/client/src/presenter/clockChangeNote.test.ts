// Verifies FR2, FR8, UX2 of show-clock-change-note-on-location-cards (D5).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { ClockChangeDirection, ClockChangeTense } from "@/model";
import { HourFormat } from "@/preferences";
import { presentClockChangeNote } from "./clockChangeNote";

const noteFor = ({
  language = "en",
  hourFormat = HourFormat.H24,
  tense,
  direction,
  amountMinutes = 60,
  wallClockTime,
}: {
  language?: "en" | "ru";
  hourFormat?: HourFormat;
  tense: ClockChangeTense;
  direction: ClockChangeDirection;
  amountMinutes?: number;
  wallClockTime: string;
}) =>
  presentClockChangeNote({
    clockChange: {
      instant: Temporal.Instant.from("2026-10-25T01:00:00Z"),
      direction,
      amountMinutes,
      wallClockTime: Temporal.PlainDateTime.from(wallClockTime),
    },
    tense,
    language,
    hourFormat,
    translate: i18n.getFixedT(language),
  }).replace(/\u202f/g, " ");

const { PAST, FUTURE } = ClockChangeTense;
const { BACK, FORWARD } = ClockChangeDirection;

describe("presentClockChangeNote", () => {
  it.each([
    [
      "ru",
      PAST,
      BACK,
      "2026-10-25T03:00",
      "25 окт. в 03:00 часы переведены на 1 ч назад",
    ],
    [
      "en",
      PAST,
      BACK,
      "2026-10-25T03:00",
      "On Oct 25 at 03:00 clocks went back 1 h",
    ],
    [
      "ru",
      FUTURE,
      BACK,
      "2026-10-25T03:00",
      "25 окт. в 03:00 часы переведут на 1 ч назад",
    ],
    [
      "en",
      FUTURE,
      BACK,
      "2026-10-25T03:00",
      "On Oct 25 at 03:00 clocks will go back 1 h",
    ],
    [
      "ru",
      FUTURE,
      FORWARD,
      "2027-03-28T02:00",
      "28 мар. в 02:00 часы переведут на 1 ч вперёд",
    ],
    [
      "en",
      FUTURE,
      FORWARD,
      "2027-03-28T02:00",
      "On Mar 28 at 02:00 clocks will go forward 1 h",
    ],
    [
      "ru",
      PAST,
      FORWARD,
      "2027-03-28T02:00",
      "28 мар. в 02:00 часы переведены на 1 ч вперёд",
    ],
    [
      "en",
      PAST,
      FORWARD,
      "2027-03-28T02:00",
      "On Mar 28 at 02:00 clocks went forward 1 h",
    ],
  ] as const)(
    "should write %s %s %s at %s as %s",
    (language, tense, direction, wallClockTime, expected) => {
      expect(noteFor({ language, tense, direction, wallClockTime })).toBe(
        expected,
      );
    },
  );

  it("should write the time in the 12-hour format", () => {
    expect(
      noteFor({
        hourFormat: HourFormat.H12,
        tense: PAST,
        direction: BACK,
        wallClockTime: "2026-10-25T03:00",
      }),
    ).toBe("On Oct 25 at 3:00 AM clocks went back 1 h");
  });

  it.each([
    ["en", 30, "On Oct 4 at 02:00 clocks will go forward 30 min"],
    ["ru", 30, "4 окт. в 02:00 часы переведут на 30 мин вперёд"],
    ["en", 90, "On Oct 4 at 02:00 clocks will go forward 1 h 30 min"],
    ["ru", 90, "4 окт. в 02:00 часы переведут на 1 ч 30 мин вперёд"],
    ["en", 120, "On Oct 4 at 02:00 clocks will go forward 2 h"],
  ] as const)(
    "should write the amount of %s %i min as %s",
    (language, amountMinutes, expected) => {
      expect(
        noteFor({
          language,
          amountMinutes,
          tense: FUTURE,
          direction: FORWARD,
          wallClockTime: "2026-10-04T02:00",
        }),
      ).toBe(expected);
    },
  );
});
