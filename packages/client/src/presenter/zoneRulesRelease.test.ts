// Verifies FR8 of add-remote-zone-rules-updates: the zone rules release line in both languages.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { presentZoneRulesRelease } from "./zoneRulesRelease";

describe("presentZoneRulesRelease", () => {
  it.each([
    ["en", "Time zone rules: 2026f"],
    ["ru", "Правила часовых поясов: 2026f"],
  ])("should name the release in %s", async (language, expected) => {
    await i18n.changeLanguage(language);
    expect(presentZoneRulesRelease("2026f", i18n.t)).toBe(expected);
  });
});
