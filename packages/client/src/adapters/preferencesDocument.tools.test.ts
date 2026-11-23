// Verifies FR3 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, ThemePreference } from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

const VERSION_8_PAYLOAD = {
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

describe("the enabled tools in the preferences document", () => {
  it("should migrate a version 8 document to no tools and keep the other choices", () => {
    const loaded = load(8, VERSION_8_PAYLOAD);
    expect(loaded).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        enabledTools: [],
        theme: ThemePreference.DARK,
        interfaceLanguage: "ru",
      },
    });
  });

  it("should round-trip the enabled tools", () => {
    const text = serializePreferencesDocument({
      ...DEFAULT_PREFERENCES,
      enabledTools: ["unixTimeConverter"],
    });
    expect(deserializePreferencesDocument(text, null)).toMatchObject({
      preferences: { enabledTools: ["unixTimeConverter"] },
    });
  });

  it("should keep an id this build does not know", () => {
    const loaded = load(PREFERENCES_SCHEMA_VERSION, {
      ...VERSION_8_PAYLOAD,
      enabledTools: ["folders"],
    });
    expect(loaded).toMatchObject({ preferences: { enabledTools: ["folders"] } });
  });

  it("should drop duplicate ids", () => {
    const loaded = load(PREFERENCES_SCHEMA_VERSION, {
      ...VERSION_8_PAYLOAD,
      enabledTools: ["a", "a"],
    });
    expect(loaded).toMatchObject({ preferences: { enabledTools: ["a"] } });
  });

  it.each([["text"], [[""]], [[1]]])(
    "should read %j as unreadable",
    (enabledTools) => {
      expect(
        load(PREFERENCES_SCHEMA_VERSION, { ...VERSION_8_PAYLOAD, enabledTools }),
      ).toEqual({ status: PreferencesLoadStatus.UNREADABLE });
    },
  );

  it("should read a document of a newer version as unreadable", () => {
    expect(
      load(PREFERENCES_SCHEMA_VERSION + 1, {
        ...VERSION_8_PAYLOAD,
        enabledTools: [],
      }),
    ).toEqual({ status: PreferencesLoadStatus.UNREADABLE });
  });
});
