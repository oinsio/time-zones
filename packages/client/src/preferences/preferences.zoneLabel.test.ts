// Verifies FR13, FR15 of show-zone-abbreviations-and-zone-label-setting.
// Verifies FR1, FR6 of add-country-to-zone-label.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  PreferencesCommandType,
  parseStoredPreferences,
  reducePreferences,
  ZoneLabelPart,
} from ".";

const { UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY } = ZoneLabelPart;

function setPart(
  zoneLabelParts: readonly ZoneLabelPart[],
  part: ZoneLabelPart,
  isShown: boolean,
) {
  return reducePreferences(
    { ...DEFAULT_PREFERENCES, zoneLabelParts },
    { type: PreferencesCommandType.SET_ZONE_LABEL_PART, part, isShown },
  );
}

function parseParts(zoneLabelParts: unknown) {
  return parseStoredPreferences({
    theme: "DARK",
    hourFormat: "H12",
    interfaceLanguage: null,
    viewMode: null,
    zoneLabelParts,
  });
}

describe("DEFAULT_PREFERENCES.zoneLabelParts", () => {
  it("should show every part", () => {
    expect(DEFAULT_PREFERENCES.zoneLabelParts).toEqual([
      UTC_OFFSET,
      ZONE_ABBREVIATION,
      COUNTRY,
    ]);
  });
});

describe("SET_ZONE_LABEL_PART", () => {
  it.each([
    [UTC_OFFSET, [ZONE_ABBREVIATION, COUNTRY]],
    [ZONE_ABBREVIATION, [UTC_OFFSET, COUNTRY]],
    [COUNTRY, [UTC_OFFSET, ZONE_ABBREVIATION]],
  ])("should hide %s", (part, expected) => {
    expect(
      setPart([UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY], part, false)
        .zoneLabelParts,
    ).toEqual(expected);
  });

  it.each([
    [UTC_OFFSET, [ZONE_ABBREVIATION], [UTC_OFFSET, ZONE_ABBREVIATION]],
    [ZONE_ABBREVIATION, [UTC_OFFSET], [UTC_OFFSET, ZONE_ABBREVIATION]],
    [UTC_OFFSET, [], [UTC_OFFSET]],
    [ZONE_ABBREVIATION, [], [ZONE_ABBREVIATION]],
    [COUNTRY, [], [COUNTRY]],
    [COUNTRY, [UTC_OFFSET], [UTC_OFFSET, COUNTRY]],
    [COUNTRY, [ZONE_ABBREVIATION], [ZONE_ABBREVIATION, COUNTRY]],
  ])("should show %s in enum order", (part, before, expected) => {
    expect(setPart(before, part, true).zoneLabelParts).toEqual(expected);
  });

  it("should allow both parts off", () => {
    expect(setPart([UTC_OFFSET], UTC_OFFSET, false).zoneLabelParts).toEqual([]);
  });

  it.each([
    [[UTC_OFFSET, ZONE_ABBREVIATION], UTC_OFFSET, true],
    [[UTC_OFFSET], ZONE_ABBREVIATION, false],
    [[], UTC_OFFSET, false],
  ])(
    "should return the same object when %j is unchanged",
    (parts, part, isShown) => {
      const preferences = { ...DEFAULT_PREFERENCES, zoneLabelParts: parts };
      const next = reducePreferences(preferences, {
        type: PreferencesCommandType.SET_ZONE_LABEL_PART,
        part,
        isShown,
      });
      expect(next).toBe(preferences);
    },
  );
});

describe("parseStoredPreferences zone label parts", () => {
  it.each([
    [[]],
    [["UTC_OFFSET"]],
    [["ZONE_ABBREVIATION"]],
    [["UTC_OFFSET", "ZONE_ABBREVIATION"]],
    [["COUNTRY"]],
    [["COUNTRY", "UTC_OFFSET"]],
    [["ZONE_ABBREVIATION", "UTC_OFFSET"]],
  ])("should accept %j", (stored) => {
    expect(parseParts(stored)).toMatchObject({ ok: true });
  });

  it("should keep the accepted parts in enum order", () => {
    expect(parseParts(["ZONE_ABBREVIATION", "UTC_OFFSET"])).toMatchObject({
      preferences: { zoneLabelParts: [UTC_OFFSET, ZONE_ABBREVIATION] },
    });
  });

  it("should keep the country last", () => {
    expect(parseParts(["COUNTRY", "UTC_OFFSET"])).toMatchObject({
      preferences: { zoneLabelParts: [UTC_OFFSET, COUNTRY] },
    });
  });

  it.each([
    ["a non-array", "UTC_OFFSET"],
    ["a missing value", undefined],
    ["an unknown value", ["CITY"]],
    ["a duplicate country", ["COUNTRY", "COUNTRY"]],
    ["a duplicate", ["UTC_OFFSET", "UTC_OFFSET"]],
  ])("should reject %s", (_name, stored) => {
    expect(parseParts(stored)).toEqual({ ok: false });
  });
});
