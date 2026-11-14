/**
 * Working time constants. Implements FR8, FR11 of add-day-colouring-setting (D3).
 */

/** The working days as Temporal `dayOfWeek` numbers, Monday = 1 to Friday = 5. */
export const WORKING_WEEKDAYS: readonly number[] = [1, 2, 3, 4, 5];

/** The share of an hour cell's span that working time must cover for the cell to be working. */
export const WORKING_CELL_MIN_SHARE = 0.5;
