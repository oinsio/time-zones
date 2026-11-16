// Verifies FR5, FR8, NFR-P1, NFR-P3 of bind-day-periods-to-sun.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { importWithSunCount, startSolarDayCount } from "@/test/solarDayCounter";

vi.mock("@/model/sun", async (importOriginal) =>
  (await import("@/test/solarDayCounter")).countSunCalls(
    await importOriginal(),
  ),
);

const ALMATY = { latitude: 43.3, longitude: 76.9 };
const MOSCOW = { latitude: 55.8, longitude: 37.6 };
const PRECISION = 3;
const LONGYEARBYEN = { latitude: 78.2, longitude: 15.6 };

let model: typeof import("@/model");
let getDayOf: (
  isoInstant: string,
  timeZoneId?: string,
) => import("@/model").ReferenceDay;

beforeAll(async () => {
  const modules = await importWithSunCount(async () => ({
    model: await import("@/model"),
    temporal: await import("@/lib/temporal"),
  }));
  model = modules.model;
  getDayOf = (isoInstant, timeZoneId = "Asia/Almaty") =>
    model.getReferenceDay(
      { ...model.INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: timeZoneId },
      modules.temporal.Temporal.Instant.from(isoInstant),
    );
});

describe("getDayPeriodStops", () => {
  it("should give Almaty on 8 March two stops per boundary, ordered", () => {
    const stops = model.getDayPeriodStops(
      ALMATY,
      getDayOf("2026-03-08T07:30:00Z"),
    );
    expect(stops?.map((stop) => stop.period)).toEqual([
      model.DayPeriod.NIGHT,
      model.DayPeriod.MORNING,
      model.DayPeriod.MORNING,
      model.DayPeriod.DAY,
      model.DayPeriod.DAY,
      model.DayPeriod.EVENING,
      model.DayPeriod.EVENING,
      model.DayPeriod.NIGHT,
    ]);
    const fractions = (stops ?? []).map((stop) => stop.fraction);
    expect(fractions).toEqual(
      [...fractions].sort((first, second) => first - second),
    );
  });

  it("should place the morning of Almaty about an hour wide, as a band", () => {
    const stops =
      model.getDayPeriodStops(ALMATY, getDayOf("2026-03-08T07:30:00Z")) ?? [];
    const morningWidth = stops[2].fraction - stops[1].fraction;
    expect(morningWidth).toBeCloseTo(0.03, 1);
  });

  it("should give one stop for a day without a boundary", () => {
    const stops = model.getDayPeriodStops(
      LONGYEARBYEN,
      getDayOf("2026-12-21T12:00:00Z", "Arctic/Longyearbyen"),
    );
    expect(stops).toEqual([{ fraction: 0, period: model.DayPeriod.NIGHT }]);
  });

  it("should give one stop of day for the polar day", () => {
    const stops = model.getDayPeriodStops(
      LONGYEARBYEN,
      getDayOf("2026-06-21T12:00:00Z", "Arctic/Longyearbyen"),
    );
    expect(stops).toEqual([{ fraction: 0, period: model.DayPeriod.DAY }]);
  });

  it("should give no stops without coordinates", () => {
    expect(
      model.getDayPeriodStops(undefined, getDayOf("2026-03-08T07:30:00Z")),
    ).toBeUndefined();
  });

  it("should compute nothing for the sun on a second call", () => {
    const day = getDayOf("2026-03-08T07:30:00Z");
    const first = model.getDayPeriodStops(ALMATY, day);
    const count = startSolarDayCount();
    const second = model.getDayPeriodStops(ALMATY, day);
    count.stop();
    expect([count.solarDays(), count.elevations(), second === first]).toEqual([
      0,
      0,
      true,
    ]);
  });

  it("should compute again for other coordinates", () => {
    const day = getDayOf("2026-03-08T07:30:00Z");
    model.getDayPeriodStops(ALMATY, day);
    const count = startSolarDayCount();
    const stops = model.getDayPeriodStops(MOSCOW, day);
    count.stop();
    expect(count.solarDays()).toBeGreaterThan(0);
    expect(stops?.[0].fraction).not.toBeCloseTo(
      model.getDayPeriodStops(ALMATY, day)?.[0].fraction ?? 0,
      PRECISION,
    );
  });
});

describe("assembleDayPeriodStops", () => {
  it("should sort the stops by position", () => {
    const day = getDayOf("2026-03-08T07:30:00Z");
    const later = {
      start: day.start.add({ hours: 12 }),
      end: day.start.add({ hours: 13 }),
      from: model.DayPeriod.DAY,
      to: model.DayPeriod.EVENING,
    };
    const earlier = {
      start: day.start.add({ hours: 6 }),
      end: day.start.add({ hours: 7 }),
      from: model.DayPeriod.NIGHT,
      to: model.DayPeriod.MORNING,
    };
    const fractions = model
      .assembleDayPeriodStops([later, earlier], day)
      .map((stop) => stop.fraction);
    expect(fractions).toEqual(
      [...fractions].sort((first, second) => first - second),
    );
  });
});
