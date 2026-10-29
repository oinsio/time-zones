import { MILLISECONDS_PER_MINUTE } from "./clock";

const UPDATE_RECHECK_INTERVAL_MINUTES = 15;

/**
 * Least time between two update checks when the page becomes visible again.
 * Implements FR10 of support-legacy-ios-12-safari.
 */
export const UPDATE_RECHECK_INTERVAL_MS =
  UPDATE_RECHECK_INTERVAL_MINUTES * MILLISECONDS_PER_MINUTE;
