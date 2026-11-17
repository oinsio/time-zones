// Verifies FR12, FR13, NFR-P3 of apply-data-updates-silently.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { startWorkCount } from "@/test/workCounters";
import { presentCityDataAttribution } from "./cityDataAttribution";

const normalizeSpaces = (text: string) => text.replace(/[  ]/g, " ");
const attributionOf = (language: string) =>
  normalizeSpaces(
    presentCityDataAttribution(language, i18n.getFixedT(language)),
  );

describe("presentCityDataAttribution", () => {
  it.each([
    ["en", "City data: GeoNames (November 14, 2026), CC BY 4.0"],
    ["ru", "Данные о городах: GeoNames (14 ноября 2026 г.), CC BY 4.0"],
  ])("should write the dump date in %s", (language, expected) => {
    expect(attributionOf(language)).toBe(expected);
  });

  it("should build no formatter for a second call with the same language", () => {
    attributionOf("en");
    const workCount = startWorkCount();
    attributionOf("en");
    workCount.stop();
    expect(workCount.formatters()).toBe(0);
  });
});
