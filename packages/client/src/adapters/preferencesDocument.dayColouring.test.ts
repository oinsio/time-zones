// Verifies FR2, FR3, FR7 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { PreferencesLoadStatus } from "@/ports";
import {
  DayColouring,
  DEFAULT_PREFERENCES,
  HourFormat,
  ThemePreference,
  ZoneLabelPart,
} from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

const VERSION_BEFORE_DAY_COLOURING = 5;

const loadDocument = (schemaVersion: number, payload: object) =>
  deserializePreferencesDocument(
    JSON.stringify({ schemaVersion, payload }),
    null,
  );

const version5Payload = {
  theme: "DARK",
  hourFormat: "H12",
  interfaceLanguage: "ru",
  viewMode: "grid",
  zoneLabelParts: ["UTC_OFFSET"],
};

describe("the day colouring in the preferences document", () => {
  it("should be written at schema version 9", () => {
    expect(PREFERENCES_SCHEMA_VERSION).toBe(9);
  });

  it("should write both fields", () => {
    const stored = JSON.parse(
      serializePreferencesDocument({
        ...DEFAULT_PREFERENCES,
        dayColouring: DayColouring.WORKING_HOURS,
        workingHours: { start: "09:07", end: "17:30" },
      }),
    );
    expect(stored.payload).toMatchObject({
      dayColouring: "WORKING_HOURS",
      workingHours: { start: "09:07", end: "17:30" },
    });
  });

  it("should load a version 5 document keeping its values and adding the defaults", () => {
    expect(loadDocument(VERSION_BEFORE_DAY_COLOURING, version5Payload)).toEqual(
      {
        status: PreferencesLoadStatus.LOADED,
        preferences: {
          theme: ThemePreference.DARK,
          hourFormat: HourFormat.H12,
          interfaceLanguage: "ru",
          viewMode: "grid",
          zoneLabelParts: [ZoneLabelPart.UTC_OFFSET],
          dayColouring: DayColouring.TIME_OF_DAY,
          workingHours: { start: "10:00", end: "18:00" },
          dayPalette: "VIVID",
          shareLanguage: null,
          shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
          enabledTools: [],
        },
      },
    );
  });

  it("should run every step on a version 1 document", () => {
    expect(
      loadDocument(1, { theme: "LIGHT", hourFormat: "H24" }),
    ).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        dayColouring: DayColouring.TIME_OF_DAY,
        workingHours: { start: "10:00", end: "18:00" },
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
        enabledTools: [],
      },
    });
  });

  it.each([
    [
      "an unknown colouring",
      {
        dayColouring: "RAINBOW",
        workingHours: { start: "10:00", end: "18:00" },
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
        enabledTools: [],
      },
    ],
    [
      "a reversed range",
      { dayColouring: "PLAIN", workingHours: { start: "18:00", end: "10:00" } },
    ],
    ["no working hours", { dayColouring: "PLAIN" }],
  ])("should treat a version 6 document with %s as unreadable", (_, extra) => {
    expect(
      loadDocument(PREFERENCES_SCHEMA_VERSION, {
        ...version5Payload,
        ...extra,
      }),
    ).toEqual({ status: PreferencesLoadStatus.UNREADABLE });
  });
});
