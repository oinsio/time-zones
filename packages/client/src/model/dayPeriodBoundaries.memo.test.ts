// Verifies NFR-P1, NFR-P3 of bind-day-periods-to-sun.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { importWithSunCount, startSolarDayCount } from "@/test/solarDayCounter";

vi.mock("@/model/sun", async (importOriginal) =>
  (await import("@/test/solarDayCounter")).countSunCalls(
    await importOriginal(),
  ),
);

const MAX_SOLAR_DAYS_PER_COORDINATES = 3;
const ALMATY = { latitude: 43.3, longitude: 76.9 };
const MOSCOW = { latitude: 55.8, longitude: 37.6 };

let getDayPeriodBoundaries: typeof import("./dayPeriodBoundaries").getDayPeriodBoundaries;
let getDayOf: (isoInstant: string) => import("./dayTrack").ReferenceDay;

beforeAll(async () => {
  const { model, temporal } = await importWithSunCount(async () => ({
    model: await import("@/model"),
    temporal: await import("@/lib/temporal"),
  }));
  getDayPeriodBoundaries = model.getDayPeriodBoundaries;
  getDayOf = (isoInstant) =>
    model.getReferenceDay(
      { ...model.INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Asia/Almaty" },
      temporal.Temporal.Instant.from(isoInstant),
    );
});

describe("getDayPeriodBoundaries memo", () => {
  it("should compute at most 3 solar days for a first call", () => {
    const count = startSolarDayCount();
    getDayPeriodBoundaries(ALMATY, getDayOf("2026-03-08T07:30:00Z"));
    count.stop();
    expect(count.solarDays()).toBeLessThanOrEqual(
      MAX_SOLAR_DAYS_PER_COORDINATES,
    );
  });

  it("should compute nothing for the same coordinates and day", () => {
    const day = getDayOf("2026-03-08T07:30:00Z");
    const first = getDayPeriodBoundaries(ALMATY, day);
    const count = startSolarDayCount();
    const second = getDayPeriodBoundaries(ALMATY, day);
    count.stop();
    expect([count.solarDays(), second === first]).toEqual([0, true]);
  });

  it("should compute again for other coordinates", () => {
    const day = getDayOf("2026-03-08T07:30:00Z");
    getDayPeriodBoundaries(ALMATY, day);
    const count = startSolarDayCount();
    getDayPeriodBoundaries(MOSCOW, day);
    count.stop();
    expect(count.solarDays()).toBeGreaterThan(0);
  });

  it("should compute again for the next reference day", () => {
    getDayPeriodBoundaries(ALMATY, getDayOf("2026-03-08T07:30:00Z"));
    const count = startSolarDayCount();
    getDayPeriodBoundaries(ALMATY, getDayOf("2026-03-09T07:30:00Z"));
    count.stop();
    expect(count.solarDays()).toBeGreaterThan(0);
  });
});
