// Verifies FR3, NFR-P2 of bind-day-periods-to-sun (D4).
import { beforeEach, describe, expect, it, vi } from "vitest";

const COORDINATES = { latitude: 43.3, longitude: 76.9 };
const INSTANT = 1_772_000_000_000;

describe("sunRegistry", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should refuse to read the sun before the support is loaded", async () => {
    const { getSunElevation } = await import("./sun");
    expect(() => getSunElevation(COORDINATES, INSTANT)).toThrow(
      "Sun support is not loaded",
    );
  });

  it("should compute the sun once the support is loaded", async () => {
    const { loadSunSupport } = await import("./sunRegistry");
    const { getSunElevation } = await import("./sun");
    await loadSunSupport();
    expect(getSunElevation(COORDINATES, INSTANT)).toBeTypeOf("number");
  });

  it("should serve the zone coordinates with the support", async () => {
    const { loadSunSupport, getSunSupport } = await import("./sunRegistry");
    await loadSunSupport();
    expect(getSunSupport().zoneCoordinates["Europe/Moscow"]).toEqual([
      558, 376,
    ]);
  });
});
