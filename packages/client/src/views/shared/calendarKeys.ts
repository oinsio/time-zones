import { KeyboardKey } from "@/constants";
import { CalendarMove } from "@/controller";

const MOVE_BY_KEY: ReadonlyMap<string, CalendarMove> = new Map([
  [KeyboardKey.ARROW_LEFT, CalendarMove.PREVIOUS_DAY],
  [KeyboardKey.ARROW_RIGHT, CalendarMove.NEXT_DAY],
  [KeyboardKey.ARROW_UP, CalendarMove.PREVIOUS_WEEK],
  [KeyboardKey.ARROW_DOWN, CalendarMove.NEXT_WEEK],
  [KeyboardKey.HOME, CalendarMove.WEEK_START],
  [KeyboardKey.END, CalendarMove.WEEK_END],
  [KeyboardKey.PAGE_UP, CalendarMove.PREVIOUS_MONTH],
  [KeyboardKey.PAGE_DOWN, CalendarMove.NEXT_MONTH],
]);

/**
 * The focus move a calendar key asks for; `undefined` for other keys.
 * Implements NFR-A2 of select-date-with-calendar-and-now (D6).
 */
export function getCalendarMoveForKey(key: string): CalendarMove | undefined {
  return MOVE_BY_KEY.get(key);
}
