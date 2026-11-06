/**
 * The deploy instant fixed into the build: the clock's instant as an ISO 8601
 * timestamp with milliseconds and the Z suffix.
 * Implements FR6 of polish-settings-and-remove-offline-update-notice (D1).
 */
import { type Clock, systemClock } from "../../src/lib/temporal.ts";

const DEPLOY_INSTANT_FRACTIONAL_DIGITS = 3;

export function resolveDeployInstant(clock: Clock = systemClock): string {
  return clock.instant().toString({
    fractionalSecondDigits: DEPLOY_INSTANT_FRACTIONAL_DIGITS,
  });
}
