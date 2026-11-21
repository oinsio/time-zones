// Verifies FR5, FR6 of add-meeting-share-dialog.
import { describe, expect, it } from "vitest";
import { PreferencesLoadStatus } from "@/ports";
import {
  DEFAULT_PREFERENCES,
  type Preferences,
  ThemePreference,
  ZoneLabelPart,
} from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

const CURRENT_PAYLOAD = {
  theme: "DARK",
  hourFormat: "H12",
  interfaceLanguage: "ru",
  zoneLabelParts: ["UTC_OFFSET"],
  viewMode: null,
  dayColouring: "TIME_OF_DAY",
  workingHours: { start: "10:00", end: "18:00" },
  dayPalette: "VIVID",
  shareLanguage: null,
  shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
};

const load = (schemaVersion: number, payload: object) =>
  deserializePreferencesDocument(
    JSON.stringify({ schemaVersion, payload }),
    null,
  );

describe("the share choices in the preferences document", () => {
  it("should migrate a version 7 document to the defaults and keep the other choices", () => {
    const {
      shareLanguage: _language,
      shareZoneLabelParts: _parts,
      ...version7Payload
    } = CURRENT_PAYLOAD;
    expect(load(7, version7Payload)).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        ...DEFAULT_PREFERENCES,
        theme: ThemePreference.DARK,
        hourFormat: "H12",
        interfaceLanguage: "ru",
        zoneLabelParts: [ZoneLabelPart.UTC_OFFSET],
        workingHours: { start: "10:00", end: "18:00" },
      },
    });
  });

  it("should round-trip a pinned language and one part", () => {
    const preferences: Preferences = {
      ...DEFAULT_PREFERENCES,
      shareLanguage: "en",
      shareZoneLabelParts: [ZoneLabelPart.ZONE_ABBREVIATION],
    };
    expect(
      deserializePreferencesDocument(
        serializePreferencesDocument(preferences),
        null,
      ),
    ).toEqual({ status: PreferencesLoadStatus.LOADED, preferences });
  });

  it("should keep a well-formed unregistered tag readable", () => {
    expect(load(8, { ...CURRENT_PAYLOAD, shareLanguage: "de" })).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: { shareLanguage: "de" },
    });
  });

  it.each([
    ["the country", { shareZoneLabelParts: ["COUNTRY"] }],
    ["an unknown part", { shareZoneLabelParts: ["CITY"] }],
    ["the number 5", { shareLanguage: 5 }],
    ["an empty string", { shareLanguage: "" }],
  ])("should be unreadable with %s", (_name, overrides) => {
    expect(load(8, { ...CURRENT_PAYLOAD, ...overrides })).toEqual({
      status: PreferencesLoadStatus.UNREADABLE,
    });
  });
});
