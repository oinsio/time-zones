// Verifies FR1, FR2 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { toEpochMilliseconds } from "@/test/sunFixtures";
import { DayPeriod, getDayPeriodAt } from "./dayPeriods";

const ALMATY = { latitude: 43.3, longitude: 76.9 };
const MURMANSK = { latitude: 69.0, longitude: 33.1 };
const LONGYEARBYEN = { latitude: 78.2, longitude: 15.6 };
const MOSCOW_ZONE = "Europe/Moscow";

describe("getDayPeriodAt", () => {
  it.each([
    ["03:00", DayPeriod.NIGHT],
    ["06:20", DayPeriod.MORNING],
    ["12:00", DayPeriod.DAY],
    ["17:45", DayPeriod.EVENING],
    ["21:00", DayPeriod.NIGHT],
  ])(
    "should give Almaty at %s on 8 March 2026 the period %s",
    (time, period) => {
      expect(
        getDayPeriodAt(
          ALMATY,
          toEpochMilliseconds("2026-03-08", time, "Asia/Almaty"),
        ),
      ).toBe(period);
    },
  );

  it.each([
    [
      "Longyearbyen",
      LONGYEARBYEN,
      "Europe/Oslo",
      "2026-12-21",
      "00:00",
      DayPeriod.NIGHT,
    ],
    [
      "Longyearbyen",
      LONGYEARBYEN,
      "Europe/Oslo",
      "2026-12-21",
      "12:00",
      DayPeriod.NIGHT,
    ],
    [
      "Longyearbyen",
      LONGYEARBYEN,
      "Europe/Oslo",
      "2026-06-21",
      "00:00",
      DayPeriod.DAY,
    ],
    [
      "Longyearbyen",
      LONGYEARBYEN,
      "Europe/Oslo",
      "2026-06-21",
      "18:00",
      DayPeriod.DAY,
    ],
    ["Murmansk", MURMANSK, MOSCOW_ZONE, "2026-12-21", "09:00", DayPeriod.NIGHT],
    [
      "Murmansk",
      MURMANSK,
      MOSCOW_ZONE,
      "2026-12-21",
      "11:30",
      DayPeriod.MORNING,
    ],
    [
      "Murmansk",
      MURMANSK,
      MOSCOW_ZONE,
      "2026-12-21",
      "14:00",
      DayPeriod.EVENING,
    ],
    ["Murmansk", MURMANSK, MOSCOW_ZONE, "2026-12-21", "17:00", DayPeriod.NIGHT],
    [
      "Murmansk",
      MURMANSK,
      MOSCOW_ZONE,
      "2026-06-21",
      "00:30",
      DayPeriod.EVENING,
    ],
    [
      "Murmansk",
      MURMANSK,
      MOSCOW_ZONE,
      "2026-06-21",
      "02:00",
      DayPeriod.MORNING,
    ],
    ["Murmansk", MURMANSK, MOSCOW_ZONE, "2026-06-21", "12:00", DayPeriod.DAY],
    [
      "Murmansk",
      MURMANSK,
      MOSCOW_ZONE,
      "2026-06-21",
      "23:30",
      DayPeriod.EVENING,
    ],
  ])(
    "should give %s on %s at %s the period %s",
    (_city, coordinates, timeZoneId, date, time, period) => {
      expect(
        getDayPeriodAt(
          coordinates,
          toEpochMilliseconds(date, time, timeZoneId),
        ),
      ).toBe(period);
    },
  );
});
