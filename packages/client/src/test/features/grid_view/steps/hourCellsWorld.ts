// Implements FR1-FR6 of add-grid-hour-cells-and-hour-frame: shared state of the hour cell unit steps.
import type { ReferenceDay } from "@/model";
import type { HourStripContext } from "@/presenter";

export type HourCellsWorld = HourStripContext & { day: ReferenceDay };

export const ZONE_BY_CITY: Record<string, string> = {
  Almaty: "Asia/Almaty",
  Moscow: "Europe/Moscow",
  Kolkata: "Asia/Kolkata",
  "New York": "America/New_York",
  Kathmandu: "Asia/Kathmandu",
};

/** The columns of a range such as `9-17`. */
export const parseColumnRange = (range: string): number[] => {
  const [first, last] = range.split("-").map(Number);
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
};
