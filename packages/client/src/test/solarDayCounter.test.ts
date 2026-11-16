// Verifies NFR-P1, NFR-P3 of bind-day-periods-to-sun.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { importWithSunCount, startSolarDayCount } from "@/test/solarDayCounter";

vi.mock("@/model/sun", async (importOriginal) =>
  (await import("@/test/solarDayCounter")).countSunCalls(
    await importOriginal(),
  ),
);

const COORDINATES = { latitude: 43.3, longitude: 76.9 };
const INSTANT = 1_772_000_000_000;

let model: typeof import("@/model");

beforeAll(async () => {
  model = await importWithSunCount(() => import("@/model"));
});

describe("startSolarDayCount", () => {
  it("should count solar days and elevations asked through the model", () => {
    const count = startSolarDayCount();
    model.getSolarDay(COORDINATES, INSTANT);
    model.getSolarDay(COORDINATES, INSTANT);
    model.getSunElevation(COORDINATES, INSTANT);
    model.getSunElevation(COORDINATES, INSTANT);
    model.getSunElevation(COORDINATES, INSTANT);
    count.stop();
    expect([count.solarDays(), count.elevations()]).toEqual([2, 3]);
  });

  it("should not count the calls after stop", () => {
    const count = startSolarDayCount();
    count.stop();
    model.getSolarDay(COORDINATES, INSTANT);
    expect(count.solarDays()).toBe(0);
  });

  it("should begin a second count at zero", () => {
    const first = startSolarDayCount();
    model.getSolarDay(COORDINATES, INSTANT);
    first.stop();
    const second = startSolarDayCount();
    second.stop();
    expect(second.solarDays()).toBe(0);
  });
});
