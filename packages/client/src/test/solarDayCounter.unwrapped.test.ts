// Verifies NFR-P1 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import {
  MISSING_SUN_MOCK_MESSAGE,
  startSolarDayCount,
} from "@/test/solarDayCounter";

describe("startSolarDayCount without the sun mock", () => {
  it("should throw an error that names the vi.mock line", () => {
    expect(() => startSolarDayCount()).toThrow(MISSING_SUN_MOCK_MESSAGE);
  });
});
