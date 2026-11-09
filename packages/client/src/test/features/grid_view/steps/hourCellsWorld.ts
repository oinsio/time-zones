// Implements FR1-FR6 of add-grid-hour-cells-and-hour-frame: shared state of the hour cell unit steps.
import { Temporal } from "@/lib/temporal";
import {
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
  type ReferenceDay,
} from "@/model";
import { HourFormat } from "@/preferences";
import {
  type HourStripContext,
  type PresentedHourStrip,
  presentHourStrip,
} from "@/presenter";

const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";

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

/** The shared presenting helpers of the hour cell unit steps; the world resets before each scenario. */
export const createHourCellsSteps = (scenarios?: {
  BeforeEachScenario: (reset: () => void) => void;
}) => {
  const world: HourCellsWorld = {
    referenceZoneId: "",
    day: undefined as unknown as ReferenceDay,
    language: "en",
    hourFormat: HourFormat.H24,
  };
  const stripOf = (city: string): PresentedHourStrip =>
    presentHourStrip(ZONE_BY_CITY[city], world);
  const setDay = (instant: string) => {
    world.day = getReferenceDay(
      { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: world.referenceZoneId },
      Temporal.Instant.from(instant),
    );
  };
  const setZoneAndDay = (_ctx: unknown, zone: string, instant: string) => {
    world.referenceZoneId = zone;
    setDay(instant);
  };
  const givenSampleDay = (_ctx: unknown, zone: string) =>
    setZoneAndDay(_ctx, zone, SAMPLE_INSTANT);
  const setLanguage = (language: "en" | "ru") => {
    world.language = language;
  };
  const labelOf = (city: string, column: number) => {
    const cell = stripOf(city).cells[column];
    return `${cell.hourText}${cell.minuteText}`;
  };
  scenarios?.BeforeEachScenario(() => {
    world.language = "en";
    world.hourFormat = HourFormat.H24;
  });
  return {
    world,
    stripOf,
    setDay,
    setZoneAndDay,
    givenSampleDay,
    setLanguage,
    labelOf,
  };
};
