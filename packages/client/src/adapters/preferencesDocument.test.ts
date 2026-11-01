// Verifies FR8 of add-interface-language-selection (D2).
import { PreferencesLoadStatus } from "@/ports";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  ThemePreference,
} from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

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

  it("should round-trip version 2", () => {
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
      "version 3",
      JSON.stringify({
        schemaVersion: 3,
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
        }),
      ),
    ).toEqual({
      schemaVersion: 2,
      payload: { theme: "DARK", hourFormat: "H12", interfaceLanguage: "ru" },
    });
  });
});
