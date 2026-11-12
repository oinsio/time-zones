// Verifies FR3, FR4 of add-view-mode-setting-and-grid-skeleton.
import { describe, expect, it } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
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

const VERSION_BEFORE_VIEW_MODE = 3;
const VERSION_WITH_VIEW_MODE = 4;

const loadDocument = (schemaVersion: number, payload: object) =>
  deserializePreferencesDocument(
    JSON.stringify({ schemaVersion, payload }),
    null,
  );

describe("the view mode in the preferences document", () => {
  it("should load a version 3 document with no view chosen and keep its other values", () => {
    expect(
      loadDocument(VERSION_BEFORE_VIEW_MODE, {
        theme: "DARK",
        hourFormat: "H12",
        interfaceLanguage: "ru",
        zoneLabelParts: ["UTC_OFFSET"],
      }),
    ).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: "ru",
        zoneLabelParts: [ZoneLabelPart.UTC_OFFSET, ZoneLabelPart.COUNTRY],
        viewMode: null,
      },
    });
  });

  it.each([1, 2])(
    "should load a version %i document with no view chosen",
    (version) => {
      expect(
        loadDocument(version, {
          theme: "LIGHT",
          hourFormat: "H24",
          ...(version === 2 ? { interfaceLanguage: null } : {}),
        }),
      ).toMatchObject({
        status: PreferencesLoadStatus.LOADED,
        preferences: { viewMode: null },
      });
    },
  );

  it("should write the current version with the view mode", () => {
    const written = JSON.parse(
      serializePreferencesDocument({
        ...DEFAULT_PREFERENCES,
        viewMode: "grid",
      }),
    );
    expect(written.schemaVersion).toBe(PREFERENCES_SCHEMA_VERSION);
    expect(written.payload.viewMode).toBe("grid");
  });

  it("should read a view mode of the wrong type as unreadable", () => {
    expect(
      loadDocument(VERSION_WITH_VIEW_MODE, {
        ...DEFAULT_PREFERENCES,
        viewMode: 42,
      }),
    ).toEqual({ status: PreferencesLoadStatus.UNREADABLE });
  });

  it("should load a view that is not registered", () => {
    expect(
      loadDocument(VERSION_WITH_VIEW_MODE, {
        ...DEFAULT_PREFERENCES,
        viewMode: "timeline",
      }),
    ).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: { viewMode: "timeline" },
    });
  });
});
