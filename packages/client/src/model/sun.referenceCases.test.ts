// Verifies FR1, FR2, FR4, M1 of bind-day-periods-to-sun.
// Source of the expected times: the spec tables of the `day-periods`
// scenarios, cross-checked at specification time against an independent
// per-minute scan of the NOAA solar calculator equations.
import { describe, expect, it } from "vitest";
import {
  getLocalNoon,
  MINUTES_TOLERANCE,
  minutesBetween,
  POLAR_MINUTES_TOLERANCE,
  toEpochMilliseconds,
} from "@/test/sunFixtures";
import { getSolarDay } from "./sun";

type ReferenceCase = {
  name: string;
  latitude: number;
  longitude: number;
  date: string;
  timeZoneId: string;
  /** The crossing to read from the solar day, and the expected local time. */
  crossing: "nightRising" | "dayRising" | "daySetting" | "nightSetting";
  time: string;
  toleranceMinutes: number;
};

const case_ = (
  name: string,
  latitude: number,
  longitude: number,
  date: string,
  timeZoneId: string,
  crossing: ReferenceCase["crossing"],
  time: string,
  toleranceMinutes = MINUTES_TOLERANCE,
): ReferenceCase => ({
  name,
  latitude,
  longitude,
  date,
  timeZoneId,
  crossing,
  time,
  toleranceMinutes,
});

const MOSCOW_ZONE = "Europe/Moscow";
const CASES: ReferenceCase[] = [
  case_(
    "Almaty",
    43.3,
    76.9,
    "2026-03-08",
    "Asia/Almaty",
    "nightRising",
    "05:48",
  ),
  case_(
    "Moscow December",
    55.8,
    37.6,
    "2026-12-21",
    MOSCOW_ZONE,
    "dayRising",
    "10:16",
  ),
  case_(
    "Moscow June",
    55.8,
    37.6,
    "2026-06-21",
    MOSCOW_ZONE,
    "nightRising",
    "02:42",
  ),
  case_(
    "Kazan June",
    55.8,
    49.1,
    "2026-06-21",
    MOSCOW_ZONE,
    "dayRising",
    "04:02",
  ),
  case_(
    "Saint Petersburg dawn",
    59.9,
    30.3,
    "2026-06-21",
    MOSCOW_ZONE,
    "nightRising",
    "01:51",
    POLAR_MINUTES_TOLERANCE,
  ),
  case_(
    "Quito",
    -0.2,
    -78.5,
    "2026-03-20",
    "America/Guayaquil",
    "daySetting",
    "17:57",
  ),
  case_(
    "Sydney",
    -33.9,
    151.2,
    "2026-12-21",
    "Australia/Sydney",
    "nightSetting",
    "20:34",
  ),
  case_(
    "New York",
    40.7,
    -74.0,
    "2026-03-08",
    "America/New_York",
    "nightRising",
    "06:51",
  ),
  case_(
    "New York day",
    40.7,
    -74.0,
    "2026-03-08",
    "America/New_York",
    "dayRising",
    "07:55",
  ),
  case_(
    "Kolkata",
    22.5,
    88.4,
    "2026-03-08",
    "Asia/Kolkata",
    "daySetting",
    "17:13",
  ),
  case_(
    "Murmansk December",
    69.0,
    33.1,
    "2026-12-21",
    MOSCOW_ZONE,
    "nightRising",
    "10:22",
    POLAR_MINUTES_TOLERANCE,
  ),
  case_(
    "Murmansk June",
    69.0,
    33.1,
    "2026-06-21",
    MOSCOW_ZONE,
    "dayRising",
    "03:12",
    POLAR_MINUTES_TOLERANCE,
  ),
];

describe("sun reference cases (M1)", () => {
  it.each(CASES)(
    "should place the $crossing of $name within its tolerance",
    (referenceCase) => {
      const solarDay = getSolarDay(
        {
          latitude: referenceCase.latitude,
          longitude: referenceCase.longitude,
        },
        getLocalNoon(referenceCase.date, referenceCase.timeZoneId),
      );
      const crossings = {
        nightRising: solarDay.night.rising,
        dayRising: solarDay.day.rising,
        daySetting: solarDay.day.setting,
        nightSetting: solarDay.night.setting,
      };
      expect(
        minutesBetween(
          crossings[referenceCase.crossing] as number,
          toEpochMilliseconds(
            referenceCase.date,
            referenceCase.time,
            referenceCase.timeZoneId,
          ),
        ),
      ).toBeLessThan(referenceCase.toleranceMinutes);
    },
  );
});
