/**
 * Working hours: one start and one end for every location, read in each
 * location's local time. Canonical ISO 8601 wall-clock times `HH:MM`.
 * Implements FR6, FR7 of add-day-colouring-setting (D1).
 */
export type WorkingHours = { start: string; end: string };

/** The working hours of a new or migrated document. */
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: "10:00",
  end: "18:00",
};

/** Why a range is not valid working hours. */
export enum WorkingHoursError {
  START_NOT_BEFORE_END = "START_NOT_BEFORE_END",
}

const CANONICAL_WALL_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isCanonicalWallTime = (value: unknown): value is string =>
  typeof value === "string" && CANONICAL_WALL_TIME_PATTERN.test(value);

/**
 * Names the fault of a range, or `undefined` when the start is before the end.
 * Canonical `HH:MM` texts compare in time order, so no Temporal is loaded here:
 * the preferences module is imported before the zone rules are installed.
 */
export function checkWorkingHours(
  workingHours: WorkingHours,
): WorkingHoursError | undefined {
  return workingHours.start < workingHours.end
    ? undefined
    : WorkingHoursError.START_NOT_BEFORE_END;
}

/** Whether a stored value is two canonical wall times in order. */
export function isWorkingHours(value: unknown): value is WorkingHours {
  if (typeof value !== "object" || value === null) return false;
  const { start, end } = value as Record<string, unknown>;
  return (
    isCanonicalWallTime(start) &&
    isCanonicalWallTime(end) &&
    checkWorkingHours({ start, end }) === undefined
  );
}
