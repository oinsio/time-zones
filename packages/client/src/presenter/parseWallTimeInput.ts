import {
  MAX_WALL_TIME_HOUR,
  MAX_WALL_TIME_MINUTE,
  WALL_TIME_INPUT_PATTERNS,
} from "@/constants";

const DIGITS_PER_TIME_PART = 2;
const MINUTE_ABSENT = 0;

/**
 * Reads a typed 24-hour wall-clock time (`9`, `930`, `9:30`, `09.30`) and
 * returns the canonical `HH:MM` of the `SET_WALL_TIME` command, or `undefined`
 * for any other text. Pure and locale-independent.
 * Implements FR2, FR6 of add-wall-time-input-with-hint (D3).
 */
export function parseWallTimeInput(text: string): string | undefined {
  const trimmedText = text.trim();
  for (const pattern of WALL_TIME_INPUT_PATTERNS) {
    const groups = pattern.exec(trimmedText)?.groups;
    if (groups === undefined) continue;
    const hour = Number(groups.hour);
    const minute = Number(groups.minute ?? MINUTE_ABSENT);
    if (hour > MAX_WALL_TIME_HOUR || minute > MAX_WALL_TIME_MINUTE) {
      return undefined;
    }
    const pad = (part: number) =>
      String(part).padStart(DIGITS_PER_TIME_PART, "0");
    return `${pad(hour)}:${pad(minute)}`;
  }
  return undefined;
}
