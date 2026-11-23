// Verifies FR4, FR5, FR7 of add-settings-page-and-device-time-location.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  PreferencesCommandType,
  parseStoredPreferences,
  reducePreferences,
  ThemePreference,
} from ".";

const STORED_ZONE_LABEL_PARTS = ["UTC_OFFSET", "ZONE_ABBREVIATION", "COUNTRY"];

describe("SET_INTERFACE_LANGUAGE", () => {
  it("should set the chosen language code", () => {
    const next = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_INTERFACE_LANGUAGE,
      interfaceLanguage: "ru",
    });
    expect(next.interfaceLanguage).toBe("ru");
  });

  it("should return the same object for an unchanged language", () => {
    const chosen = { ...DEFAULT_PREFERENCES, interfaceLanguage: "ru" };
    const next = reducePreferences(chosen, {
      type: PreferencesCommandType.SET_INTERFACE_LANGUAGE,
      interfaceLanguage: "ru",
    });
    expect(next).toBe(chosen);
  });

  it("should accept a stored language code", () => {
    expect(
      parseStoredPreferences({
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: "ru",
        viewMode: null,
        dayColouring: "TIME_OF_DAY",
        workingHours: { start: "10:00", end: "18:00" },
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
        enabledTools: [],
      }),
    ).toEqual({
      ok: true,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: "ru",
        viewMode: null,
        dayColouring: "TIME_OF_DAY",
        workingHours: { start: "10:00", end: "18:00" },
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
        enabledTools: [],
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    });
  });
});
