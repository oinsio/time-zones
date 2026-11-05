// Verifies FR8 of add-interface-language-selection (D2).
// Verifies FR13, FR15, M6 of show-zone-abbreviations-and-zone-label-setting (D4).
import { PreferencesLoadStatus } from "@/ports";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  ThemePreference,
  ZoneLabelPart,
} from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

const BOTH_PARTS = [ZoneLabelPart.UTC_OFFSET, ZoneLabelPart.ZONE_ABBREVIATION];

const versionOneDocument = JSON.stringify({
  schemaVersion: 1,
  payload: { theme: "DARK", hourFormat: "H12" },
});

describe("deserializePreferencesDocument", () => {
  it("should migrate version 1 with the legacy language", () => {
    expect(deserializePreferencesDocument(versionOneDocument, "ru")).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: "ru",
        zoneLabelParts: BOTH_PARTS,
      },
    });
  });

  it("should migrate version 1 without a legacy language to not chosen", () => {
    const outcome = deserializePreferencesDocument(versionOneDocument, null);
    expect(outcome).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: { interfaceLanguage: null },
    });
  });

  it("should round-trip the current version", () => {
    const preferences = { ...DEFAULT_PREFERENCES, interfaceLanguage: "ru" };
    expect(
      deserializePreferencesDocument(
        serializePreferencesDocument(preferences),
        null,
      ),
    ).toEqual({ status: PreferencesLoadStatus.LOADED, preferences });
  });

  it("should ignore the legacy language in a version 2 document", () => {
    const rawDocument = serializePreferencesDocument(DEFAULT_PREFERENCES);
    expect(deserializePreferencesDocument(rawDocument, "ru")).toMatchObject({
      preferences: { interfaceLanguage: null },
    });
  });

  it.each([
    [
      "version 4",
      JSON.stringify({
        schemaVersion: 4,
        payload: { ...DEFAULT_PREFERENCES },
      }),
    ],
    [
      "version 2 without an interface language",
      JSON.stringify({
        schemaVersion: 2,
        payload: { theme: "DARK", hourFormat: "H12" },
      }),
    ],
    ["invalid JSON", "{not json"],
    [
      "a non-integer version",
      JSON.stringify({ schemaVersion: "2", payload: DEFAULT_PREFERENCES }),
    ],
  ])("should load %s as unreadable", (_name, rawDocument) => {
    expect(deserializePreferencesDocument(rawDocument, null)).toEqual({
      status: PreferencesLoadStatus.UNREADABLE,
    });
  });

  it("should load no document as empty", () => {
    expect(deserializePreferencesDocument(null, null)).toEqual({
      status: PreferencesLoadStatus.EMPTY,
    });
  });
});

describe("serializePreferencesDocument", () => {
  it("should write the current version with the payload", () => {
    expect(
      JSON.parse(
        serializePreferencesDocument({
          theme: ThemePreference.DARK,
          hourFormat: HourFormat.H12,
          interfaceLanguage: "ru",
          zoneLabelParts: BOTH_PARTS,
        }),
      ),
    ).toEqual({
      schemaVersion: 3,
      payload: {
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: "ru",
        zoneLabelParts: BOTH_PARTS,
      },
    });
  });
});
