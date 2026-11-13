// Verifies FR13, FR15, M6 of show-zone-abbreviations-and-zone-label-setting (D4).
// Verifies FR6, M2 of add-country-to-zone-label.
import { describe, expect, it } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { PreferencesLoadStatus } from "@/ports";
import {
  HourFormat,
  type Preferences,
  ThemePreference,
  ZoneLabelPart,
} from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

const { UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY } = ZoneLabelPart;
const ALL_PARTS = [UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY];

describe("the zone label in the preferences document", () => {
  it("should give a version 2 document every part and keep its other values", () => {
    const rawDocument = JSON.stringify({
      schemaVersion: 2,
      payload: { theme: "DARK", hourFormat: "H12", interfaceLanguage: "ru" },
    });
    expect(deserializePreferencesDocument(rawDocument, null)).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: "ru",
        zoneLabelParts: ALL_PARTS,
        viewMode: null,
      },
    });
  });

  it("should run both steps on a version 1 document", () => {
    const rawDocument = JSON.stringify({
      schemaVersion: 1,
      payload: { theme: "LIGHT", hourFormat: "H24" },
    });
    expect(deserializePreferencesDocument(rawDocument, "ru")).toMatchObject({
      preferences: { interfaceLanguage: "ru", zoneLabelParts: ALL_PARTS },
    });
  });

  it("should round-trip a current document with the offset only", () => {
    const preferences: Preferences = {
      theme: ThemePreference.SYSTEM,
      hourFormat: HourFormat.H24,
      interfaceLanguage: null,
      zoneLabelParts: [UTC_OFFSET],
      viewMode: null,
    };
    expect(
      deserializePreferencesDocument(
        serializePreferencesDocument(preferences),
        null,
      ),
    ).toEqual({ status: PreferencesLoadStatus.LOADED, preferences });
  });

  it("should read a newer version as unreadable", () => {
    const rawDocument = JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION + 1,
      payload: {},
    });
    expect(deserializePreferencesDocument(rawDocument, null)).toEqual({
      status: PreferencesLoadStatus.UNREADABLE,
    });
  });

  it("should be at schema version 5", () => {
    expect(PREFERENCES_SCHEMA_VERSION).toBe(5);
  });

  it.each([
    [["UTC_OFFSET"], [UTC_OFFSET, COUNTRY]],
    [[], [COUNTRY]],
    [["UTC_OFFSET", "ZONE_ABBREVIATION"], ALL_PARTS],
  ])(
    "should add the country to a version 4 document with %j",
    (storedParts, expectedParts) => {
      const rawDocument = JSON.stringify({
        schemaVersion: 4,
        payload: {
          theme: "DARK",
          hourFormat: "H12",
          interfaceLanguage: "ru",
          zoneLabelParts: storedParts,
          viewMode: "grid",
        },
      });
      expect(deserializePreferencesDocument(rawDocument, null)).toEqual({
        status: PreferencesLoadStatus.LOADED,
        preferences: {
          theme: ThemePreference.DARK,
          hourFormat: HourFormat.H12,
          interfaceLanguage: "ru",
          zoneLabelParts: expectedParts,
          viewMode: "grid",
        },
      });
    },
  );

  it.each([3, 2, 1])(
    "should show the country exactly once after migrating version %i",
    (schemaVersion) => {
      const rawDocument = JSON.stringify({
        schemaVersion,
        payload: {
          theme: "LIGHT",
          hourFormat: "H24",
          interfaceLanguage: null,
          ...(schemaVersion === 3
            ? { zoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"] }
            : {}),
        },
      });
      expect(deserializePreferencesDocument(rawDocument, null)).toMatchObject({
        preferences: { zoneLabelParts: ALL_PARTS },
      });
    },
  );

  it("should round-trip a version 5 document without the country", () => {
    const preferences: Preferences = {
      theme: ThemePreference.SYSTEM,
      hourFormat: HourFormat.H24,
      interfaceLanguage: null,
      zoneLabelParts: [UTC_OFFSET, ZONE_ABBREVIATION],
      viewMode: null,
    };
    expect(
      deserializePreferencesDocument(
        serializePreferencesDocument(preferences),
        null,
      ),
    ).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences,
    });
  });

  it.each([
    ["a version 5 document with the country twice", 5, ["COUNTRY", "COUNTRY"]],
    ["a version 4 document with a non-array", 4, "UTC_OFFSET"],
  ])("should read %s as unreadable", (_name, schemaVersion, zoneLabelParts) => {
    const rawDocument = JSON.stringify({
      schemaVersion,
      payload: {
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: null,
        zoneLabelParts,
        viewMode: null,
      },
    });
    expect(deserializePreferencesDocument(rawDocument, null)).toEqual({
      status: PreferencesLoadStatus.UNREADABLE,
    });
  });
});
