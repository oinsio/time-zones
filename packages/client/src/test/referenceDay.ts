import type { Temporal } from "@/lib/temporal";
import {
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
  type ReferenceDay,
} from "@/model";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "./deviceTimeZone";

/**
 * The live reference day of an instant in a device zone, for tests that call
 * the presenter directly.
 * Implements FR1 of add-time-sliders-to-location-cards (D5).
 */
export function buildReferenceDay(
  instant: Temporal.Instant,
  deviceTimeZoneId: string = UNIT_TEST_DEVICE_TIME_ZONE,
): ReferenceDay {
  return getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId },
    instant,
  );
}
