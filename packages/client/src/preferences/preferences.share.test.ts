// Verifies FR5, FR6 of add-meeting-share-dialog.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  PreferencesCommandType,
  parseStoredPreferences,
  reducePreferences,
  ZoneLabelPart,
} from ".";

const { UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY } = ZoneLabelPart;

const BOTH_PARTS = [UTC_OFFSET, ZONE_ABBREVIATION];

function toggle(
  shareZoneLabelParts: readonly ZoneLabelPart[],
  part: ZoneLabelPart,
) {
  return reducePreferences(
    { ...DEFAULT_PREFERENCES, shareZoneLabelParts },
    { type: PreferencesCommandType.TOGGLE_SHARE_ZONE_LABEL_PART, part },
  ).shareZoneLabelParts;
}

function parseShare(overrides: Record<string, unknown>) {
  return parseStoredPreferences({
    theme: "DARK",
    hourFormat: "H12",
    interfaceLanguage: null,
    zoneLabelParts: [],
    viewMode: null,
    dayColouring: "TIME_OF_DAY",
    workingHours: { start: "10:00", end: "18:00" },
    dayPalette: "VIVID",
    shareLanguage: null,
    shareZoneLabelParts: BOTH_PARTS,
    enabledTools: [],
    ...overrides,
  });
}

describe("DEFAULT_PREFERENCES share choices", () => {
  it("should pin no share language", () => {
    expect(DEFAULT_PREFERENCES.shareLanguage).toBeNull();
  });

  it("should show the UTC offset and the zone abbreviation", () => {
    expect(DEFAULT_PREFERENCES.shareZoneLabelParts).toEqual(BOTH_PARTS);
  });
});

describe("SET_SHARE_LANGUAGE", () => {
  it.each(["en", null])("should set the share language to %s", (language) => {
    const pinned = { ...DEFAULT_PREFERENCES, shareLanguage: "ru" };
    expect(
      reducePreferences(pinned, {
        type: PreferencesCommandType.SET_SHARE_LANGUAGE,
        shareLanguage: language,
      }).shareLanguage,
    ).toBe(language);
  });

  it("should return the same object for an unchanged language", () => {
    expect(
      reducePreferences(DEFAULT_PREFERENCES, {
        type: PreferencesCommandType.SET_SHARE_LANGUAGE,
        shareLanguage: null,
      }),
    ).toBe(DEFAULT_PREFERENCES);
  });
});

describe("TOGGLE_SHARE_ZONE_LABEL_PART", () => {
  it.each([
    [BOTH_PARTS, UTC_OFFSET, [ZONE_ABBREVIATION]],
    [BOTH_PARTS, ZONE_ABBREVIATION, [UTC_OFFSET]],
    [[UTC_OFFSET], UTC_OFFSET, []],
    [[], UTC_OFFSET, [UTC_OFFSET]],
    [[ZONE_ABBREVIATION], UTC_OFFSET, BOTH_PARTS],
  ])("should toggle %j with %s into %j", (parts, part, expected) => {
    expect(toggle(parts, part)).toEqual(expected);
  });

  it("should ignore the country", () => {
    const before = { ...DEFAULT_PREFERENCES };
    expect(
      reducePreferences(before, {
        type: PreferencesCommandType.TOGGLE_SHARE_ZONE_LABEL_PART,
        part: COUNTRY,
      }),
    ).toBe(before);
  });
});

describe("parseStoredPreferences share choices", () => {
  it("should read the pinned language and the parts", () => {
    const parsed = parseShare({
      shareLanguage: "de",
      shareZoneLabelParts: [ZONE_ABBREVIATION],
    });
    expect(parsed).toMatchObject({
      ok: true,
      preferences: {
        shareLanguage: "de",
        shareZoneLabelParts: [ZONE_ABBREVIATION],
      },
    });
  });

  it("should keep the parts in enum order", () => {
    const parsed = parseShare({
      shareZoneLabelParts: [ZONE_ABBREVIATION, UTC_OFFSET],
    });
    expect(parsed).toMatchObject({
      preferences: { shareZoneLabelParts: BOTH_PARTS },
    });
  });

  it.each([
    [{ shareZoneLabelParts: [COUNTRY] }],
    [{ shareZoneLabelParts: ["CITY"] }],
    [{ shareZoneLabelParts: "UTC_OFFSET" }],
    [{ shareZoneLabelParts: [UTC_OFFSET, UTC_OFFSET] }],
    [{ shareZoneLabelParts: undefined }],
    [{ shareLanguage: 5 }],
    [{ shareLanguage: "" }],
    [{ shareLanguage: undefined }],
  ])("should reject %j", (overrides) => {
    expect(parseShare(overrides)).toEqual({ ok: false });
  });
});
