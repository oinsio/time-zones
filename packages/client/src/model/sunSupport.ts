import zoneCoordinates from "virtual:zone-coordinates";

/**
 * The entry of the lazily loaded chunk of the sun (see `sunRegistry.ts`).
 * Implements NFR-P2 of bind-day-periods-to-sun (D1, D4).
 */
export { computeDayPeriodBoundaries } from "./dayPeriodBoundaryCalculation";
export { getSolarDay } from "./sunCalculation";
export { getSunElevation } from "./sunPosition";
export { zoneCoordinates };
