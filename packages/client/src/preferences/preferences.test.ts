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
      interfaceLanguage: null,
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
    const outcome = parseStoredPreferences({
      theme,
      hourFormat: "H12",
      interfaceLanguage: null,
    });
    expect(outcome).toEqual({
      ok: true,
      preferences: {
        theme,
        hourFormat: HourFormat.H12,
        interfaceLanguage: null,
      },
    });
  });

  it.each(Object.values(HourFormat))(
    "should accept hour format %s",
    (hourFormat) => {
      expect(
        parseStoredPreferences({
          theme: "DARK",
          hourFormat,
          interfaceLanguage: null,
        }).ok,
      ).toBe(true);
    },
  );

  it.each([
    ["a non-object", "text"],
    ["null", null],
    ["a missing hour format", { theme: "DARK", interfaceLanguage: null }],
    ["a missing theme", { hourFormat: "H12", interfaceLanguage: null }],
    ["a missing interface language", { theme: "DARK", hourFormat: "H12" }],
    [
      "an empty interface language",
      { theme: "DARK", hourFormat: "H12", interfaceLanguage: "" },
    ],
    [
      "a numeric interface language",
      { theme: "DARK", hourFormat: "H12", interfaceLanguage: 42 },
    ],
    [
      "an object interface language",
      { theme: "DARK", hourFormat: "H12", interfaceLanguage: {} },
    ],
    [
      "an unknown theme",
      { theme: "SEPIA", hourFormat: "H12", interfaceLanguage: null },
    ],
    [
      "an unknown hour format",
      { theme: "DARK", hourFormat: "H36", interfaceLanguage: null },
    ],
  ])("should reject %s", (_name, payload) => {
    expect(parseStoredPreferences(payload)).toEqual({ ok: false });
  });
});

// Verifies FR7 of add-interface-language-selection (D1).
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
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: "ru",
      }),
    ).toEqual({
      ok: true,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: "ru",
      },
    });
  });
});
