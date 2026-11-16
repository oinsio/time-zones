// Verifies NFR-P1, NFR-P3 of bind-day-periods-to-sun.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { importWithSunCount, startSolarDayCount } from "@/test/solarDayCounter";

vi.mock("@/model/sun", async (importOriginal) =>
  (await import("@/test/solarDayCounter")).countSunCalls(
    await importOriginal(),
  ),
);

const ALMATY = { latitude: 43.3, longitude: 76.9 };
const ALMATY_ZONE = "Asia/Almaty";

let model: typeof import("@/model");
let day: import("@/model").ReferenceDay;

beforeAll(async () => {
  const modules = await importWithSunCount(async () => ({
    model: await import("@/model"),
    temporal: await import("@/lib/temporal"),
  }));
  model = modules.model;
  day = model.getReferenceDay(
    { ...model.INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: ALMATY_ZONE },
    modules.temporal.Temporal.Instant.from("2026-03-08T07:30:00Z"),
  );
});

describe("getHourCells and getDayPeriodStops share the sun", () => {
  it("should compute no solar day for the cells after the stops of the same coordinates", () => {
    model.getDayPeriodStops(ALMATY, day);
    const count = startSolarDayCount();
    model.getHourCells(ALMATY_ZONE, day, ALMATY_ZONE, ALMATY);
    count.stop();
    expect(count.solarDays()).toBe(0);
  });

  it("should compute nothing on a second call for the cells", () => {
    const first = model.getHourCells(ALMATY_ZONE, day, ALMATY_ZONE, ALMATY);
    const count = startSolarDayCount();
    const second = model.getHourCells(ALMATY_ZONE, day, ALMATY_ZONE, ALMATY);
    count.stop();
    expect([count.solarDays(), count.elevations(), second === first]).toEqual([
      0,
      0,
      true,
    ]);
  });
});
