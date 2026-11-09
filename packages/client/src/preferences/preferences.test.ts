// Verifies FR4, FR5, FR7 of add-settings-page-and-device-time-location.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  PreferencesCommandType,
  parseStoredPreferences,
  reducePreferences,
  ThemePreference,
  ZoneLabelPart,
} from ".";

const STORED_ZONE_LABEL_PARTS = ["UTC_OFFSET", "ZONE_ABBREVIATION"];

describe("DEFAULT_PREFERENCES", () => {
  it("should follow the system theme in the 24-hour format", () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      theme: ThemePreference.SYSTEM,
      hourFormat: HourFormat.H24,
      interfaceLanguage: null,
      viewMode: null,
      zoneLabelParts: [
        ZoneLabelPart.UTC_OFFSET,
        ZoneLabelPart.ZONE_ABBREVIATION,
      ],
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
      zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      theme,
      hourFormat: "H12",
      interfaceLanguage: null,
      viewMode: null,
    });
    expect(outcome).toEqual({
      ok: true,
      preferences: {
        theme,
        hourFormat: HourFormat.H12,
        interfaceLanguage: null,
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    });
  });

  it.each(Object.values(HourFormat))(
    "should accept hour format %s",
    (hourFormat) => {
      expect(
        parseStoredPreferences({
          zoneLabelParts: STORED_ZONE_LABEL_PARTS,
          theme: "DARK",
          hourFormat,
          interfaceLanguage: null,
          viewMode: null,
        }).ok,
      ).toBe(true);
    },
  );

  it.each([
    ["a non-object", "text"],
    ["null", null],
    [
      "a missing hour format",
      {
        theme: "DARK",
        interfaceLanguage: null,
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "a missing theme",
      {
        hourFormat: "H12",
        interfaceLanguage: null,
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "a missing interface language",
      {
        theme: "DARK",
        hourFormat: "H12",
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "an empty interface language",
      {
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: "",
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "a numeric interface language",
      {
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: 42,
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "an object interface language",
      {
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: {},
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "an unknown theme",
      {
        theme: "SEPIA",
        hourFormat: "H12",
        interfaceLanguage: null,
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    ],
    [
      "an unknown hour format",
      {
        theme: "DARK",
        hourFormat: "H36",
        interfaceLanguage: null,
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
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
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: "ru",
        viewMode: null,
      }),
    ).toEqual({
      ok: true,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: "ru",
        viewMode: null,
        zoneLabelParts: STORED_ZONE_LABEL_PARTS,
      },
    });
  });
});
