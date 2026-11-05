// Verifies FR3 of show-zone-abbreviations-and-zone-label-setting (D3).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { formatZoneAbbreviation } from "./zoneAbbreviation";

describe("formatZoneAbbreviation", () => {
  it.each([
    ["MSK", "ru", "МСК"],
    ["MSK", "en", "MSK"],
    ["IST", "ru", "IST"],
    ["IST", "en", "IST"],
    ["EDT", "ru", "EDT"],
  ])("writes %s in %s as %s", (abbreviation, language, expected) => {
    expect(formatZoneAbbreviation(abbreviation, i18n.getFixedT(language))).toBe(
      expected,
    );
  });
});
