// Implements NFR-P1 of show-clock-change-note-on-location-cards.
import type { Location } from "@/model";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { BUDGET_ROW_COUNT } from "./rowBudgetWorld";

export const NOTE_BUDGET_NOW = "2026-03-08T07:30:00Z";
export const NOTE_BUDGET_LATER_MINUTE = "2026-03-08T07:37:00Z";
export const NOTE_BUDGET_DEVICE_TIME_ZONE = "UTC";
const NOTE_BUDGET_CITIES = [
  "Moscow",
  "New York",
  "Belgrade",
  "Chicago",
  "Lord Howe Island",
];

/** 50 locations cycling five cities, two of which have a clock change near the budget moment. */
export const buildNoteBudgetLocations = (): Location[] =>
  Array.from({ length: BUDGET_ROW_COUNT }, (_, index) => {
    const city = NOTE_BUDGET_CITIES[index % NOTE_BUDGET_CITIES.length];
    return buildLocation({ label: `${city} ${index}`, ...KNOWN_CITIES[city] });
  });
