import { DayColouring, DEFAULT_WORKING_HOURS } from "@/preferences";

/**
 * The day colouring fields of a presenter context in the default Time of day
 * colouring, for fixtures that do not care about colours.
 * Verifies FR2 of add-day-colouring-setting.
 */
export const TIME_OF_DAY_CONTEXT = {
  dayColouring: DayColouring.TIME_OF_DAY,
  workingHours: DEFAULT_WORKING_HOURS,
} as const;
