// Verifies FR13, FR15, M6 of show-zone-abbreviations-and-zone-label-setting (D4).
import { describe, expect, it } from "vitest";
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

const BOTH_PARTS = [ZoneLabelPart.UTC_OFFSET, ZoneLabelPart.ZONE_ABBREVIATION];

describe("the zone label in the preferences document", () => {
  it("should give a version 2 document both parts and keep its other values", () => {
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
        zoneLabelParts: BOTH_PARTS,
      },
    });
  });

  it("should run both steps on a version 1 document", () => {
    const rawDocument = JSON.stringify({
      schemaVersion: 1,
      payload: { theme: "LIGHT", hourFormat: "H24" },
    });
    expect(deserializePreferencesDocument(rawDocument, "ru")).toMatchObject({
      preferences: { interfaceLanguage: "ru", zoneLabelParts: BOTH_PARTS },
    });
  });

  it("should round-trip a version 3 document with the offset only", () => {
    const preferences: Preferences = {
      theme: ThemePreference.SYSTEM,
      hourFormat: HourFormat.H24,
      interfaceLanguage: null,
      zoneLabelParts: [ZoneLabelPart.UTC_OFFSET],
    };
    expect(
      deserializePreferencesDocument(
        serializePreferencesDocument(preferences),
        null,
      ),
    ).toEqual({ status: PreferencesLoadStatus.LOADED, preferences });
  });

  it("should read version 4 as unreadable", () => {
    const rawDocument = JSON.stringify({ schemaVersion: 4, payload: {} });
    expect(deserializePreferencesDocument(rawDocument, null)).toEqual({
      status: PreferencesLoadStatus.UNREADABLE,
    });
  });
});
