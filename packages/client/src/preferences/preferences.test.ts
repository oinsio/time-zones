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

describe("DEFAULT_PREFERENCES", () => {
  it("should follow the system theme in the 24-hour format", () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      theme: ThemePreference.SYSTEM,
      hourFormat: HourFormat.H24,
    });
  });
});

describe("reducePreferences", () => {
  it("should apply SET_THEME", () => {
    const next = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_THEME,
      theme: ThemePreference.DARK,
    });
    expect(next).toEqual({
      ...DEFAULT_PREFERENCES,
      theme: ThemePreference.DARK,
    });
  });

  it("should apply SET_HOUR_FORMAT", () => {
    const next = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_HOUR_FORMAT,
      hourFormat: HourFormat.H12,
    });
    expect(next.hourFormat).toBe(HourFormat.H12);
  });

  it("should return the same object for an unchanged theme", () => {
    const next = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_THEME,
      theme: DEFAULT_PREFERENCES.theme,
    });
    expect(next).toBe(DEFAULT_PREFERENCES);
  });

  it("should return the same object for an unchanged hour format", () => {
    const next = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_HOUR_FORMAT,
      hourFormat: DEFAULT_PREFERENCES.hourFormat,
    });
    expect(next).toBe(DEFAULT_PREFERENCES);
  });
});

describe("parseStoredPreferences", () => {
  it.each(Object.values(ThemePreference))("should accept theme %s", (theme) => {
    const outcome = parseStoredPreferences({ theme, hourFormat: "H12" });
    expect(outcome).toEqual({
      ok: true,
      preferences: { theme, hourFormat: HourFormat.H12 },
    });
  });

  it.each(Object.values(HourFormat))(
    "should accept hour format %s",
    (hourFormat) => {
      expect(parseStoredPreferences({ theme: "DARK", hourFormat }).ok).toBe(
        true,
      );
    },
  );

  it.each([
    ["a non-object", "text"],
    ["null", null],
    ["a missing hour format", { theme: "DARK" }],
    ["a missing theme", { hourFormat: "H12" }],
    ["an unknown theme", { theme: "SEPIA", hourFormat: "H12" }],
    ["an unknown hour format", { theme: "DARK", hourFormat: "H36" }],
  ])("should reject %s", (_name, payload) => {
    expect(parseStoredPreferences(payload)).toEqual({ ok: false });
  });
});
