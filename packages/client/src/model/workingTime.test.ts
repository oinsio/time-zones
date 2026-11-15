// Verifies FR8, FR10, FR11, NFR-P1 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";
import {
  getHourCellWorkingFlags,
  isWorkingDay,
  isWorkingTime,
} from "./workingTime";

const ALMATY = "Asia/Almaty";
const MOSCOW = "Europe/Moscow";
const NEW_YORK = "America/New_York";
const CAIRO = "Africa/Cairo";
const TEN_TO_SIX = { start: "10:00", end: "18:00" };

const dayIn = (referenceZoneId: string, instant: string) =>
  getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: referenceZoneId },
    Temporal.Instant.from(instant),
  );

const hours = (start: string, end: string) => ({ start, end });

const columnsOf = (flags: readonly boolean[]) =>
  flags.flatMap((isWorking, column) => (isWorking ? [column] : []));

const range = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, offset) => first + offset);

describe("isWorkingDay", () => {
  it.each([
    ["2026-03-09", true],
    ["2026-03-10", true],
    ["2026-03-11", true],
    ["2026-03-12", true],
    ["2026-03-13", true],
    ["2026-03-14", false],
    ["2026-03-15", false],
  ])("should answer %s with %s", (date, expected) => {
    expect(isWorkingDay(Temporal.PlainDate.from(date))).toBe(expected);
  });
});

describe("isWorkingTime", () => {
  it.each([
    [
      "Tokyo at the same moment is 16:00",
      "2026-03-09T07:00:00Z",
      "Asia/Tokyo",
      true,
    ],
    [
      "Moscow 15:00 is Tokyo 21:00",
      "2026-03-09T12:00:00Z",
      "Asia/Tokyo",
      false,
    ],
    [
      "Moscow at the Tokyo 10:00 moment is 04:00",
      "2026-03-09T01:00:00Z",
      MOSCOW,
      false,
    ],
    ["Tokyo 10:00 itself", "2026-03-09T01:00:00Z", "Asia/Tokyo", true],
    ["the end is excluded", "2026-03-09T15:00:00Z", MOSCOW, false],
    ["a minute before the end", "2026-03-09T14:59:00Z", MOSCOW, true],
    ["a minute before the start", "2026-03-09T06:59:00Z", MOSCOW, false],
    ["a Saturday", "2026-03-14T09:00:00Z", MOSCOW, false],
    ["a Sunday", "2026-03-15T09:00:00Z", MOSCOW, false],
    [
      "Friday in New York while Saturday in Moscow",
      "2026-03-13T20:00:00Z",
      NEW_YORK,
      true,
    ],
  ])("should answer %s", (_, instant, zone, expected) => {
    expect(
      isWorkingTime(Temporal.Instant.from(instant), zone, TEN_TO_SIX),
    ).toBe(expected);
  });
});

describe("getHourCellWorkingFlags", () => {
  const almatyMonday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
  it.each([
    ["09:07", "18:00", ALMATY, range(9, 17)],
    ["09:40", "18:00", ALMATY, range(10, 17)],
    ["10:00", "18:00", "Asia/Kolkata", range(9, 17)],
    ["10:15", "18:00", "Asia/Kolkata", range(10, 17)],
    ["10:00", "18:00", "Asia/Kathmandu", range(9, 16)],
  ])(
    "should let half of the hour decide for %s-%s in %s",
    (start, end, zone, columns) => {
      expect(
        columnsOf(
          getHourCellWorkingFlags(zone, almatyMonday, hours(start, end)),
        ),
      ).toEqual(columns);
    },
  );

  it("should mark no Moscow cell and only column 0 of New York on a Moscow Saturday", () => {
    const saturday = dayIn(MOSCOW, "2026-03-14T09:00:00Z");
    expect(
      columnsOf(getHourCellWorkingFlags(MOSCOW, saturday, TEN_TO_SIX)),
    ).toEqual([]);
    expect(
      columnsOf(getHourCellWorkingFlags(NEW_YORK, saturday, TEN_TO_SIX)),
    ).toEqual([0]);
  });

  it("should mark the columns 12-19 of Cairo on its clock change day", () => {
    const friday = dayIn(ALMATY, "2026-04-24T06:00:00Z");
    expect(
      columnsOf(getHourCellWorkingFlags(CAIRO, friday, TEN_TO_SIX)),
    ).toEqual(range(12, 19));
  });

  it("should give one flag per cell and the same array on a repeated call", () => {
    const flags = getHourCellWorkingFlags(ALMATY, almatyMonday, TEN_TO_SIX);
    expect(flags).toHaveLength(24);
    expect(getHourCellWorkingFlags(ALMATY, almatyMonday, TEN_TO_SIX)).toBe(
      flags,
    );
  });

  it("should measure the half against the shorter last cell of a day", () => {
    const monday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
    const shortDay = {
      ...monday,
      end: monday.start.add({ minutes: 90 }),
      lengthMinutes: 90,
    };
    const flags = getHourCellWorkingFlags(
      ALMATY,
      shortDay,
      hours("00:00", "01:20"),
    );
    expect(flags).toEqual([true, true]);
  });
});
