// Verifies NFR-A2 of select-date-with-calendar-and-now (D6: the key mapping; the keyboard itself is proven in the browser).
import { describe, expect, it } from "vitest";
import { KeyboardKey } from "@/constants";
import { CalendarMove } from "@/controller";
import { getCalendarMoveForKey } from "./calendarKeys";

describe("getCalendarMoveForKey", () => {
  it.each([
    [KeyboardKey.ARROW_LEFT, CalendarMove.PREVIOUS_DAY],
    [KeyboardKey.ARROW_RIGHT, CalendarMove.NEXT_DAY],
    [KeyboardKey.ARROW_UP, CalendarMove.PREVIOUS_WEEK],
    [KeyboardKey.ARROW_DOWN, CalendarMove.NEXT_WEEK],
    [KeyboardKey.HOME, CalendarMove.WEEK_START],
    [KeyboardKey.END, CalendarMove.WEEK_END],
    [KeyboardKey.PAGE_UP, CalendarMove.PREVIOUS_MONTH],
    [KeyboardKey.PAGE_DOWN, CalendarMove.NEXT_MONTH],
  ])("should map %s to %s", (key, expectedMove) => {
    expect(getCalendarMoveForKey(key)).toBe(expectedMove);
  });

  it.each(["Tab", "Enter", "constructor"])(
    "should map %s to no move",
    (key) => {
      expect(getCalendarMoveForKey(key)).toBeUndefined();
    },
  );
});
