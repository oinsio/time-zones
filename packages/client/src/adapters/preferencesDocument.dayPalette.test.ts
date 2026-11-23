// Verifies FR3 of redesign-cards-grid-and-day-palettes.
import { describe, expect, it } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { PreferencesLoadStatus } from "@/ports";
import { DayPalette, DEFAULT_PREFERENCES } from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";

const VERSION_BEFORE_DAY_PALETTE = 6;

const version6Payload = {
  theme: "DARK",
  hourFormat: "H12",
  interfaceLanguage: "ru",
  viewMode: "grid",
  zoneLabelParts: ["UTC_OFFSET"],
  dayColouring: "WORKING_HOURS",
  workingHours: { start: "08:00", end: "17:00" },
};

describe("the day palette in the preferences document", () => {
  it("should be written at schema version 9", () => {
    expect(PREFERENCES_SCHEMA_VERSION).toBe(9);
  });

  it("should write the palette", () => {
    const stored = JSON.parse(
      serializePreferencesDocument({
        ...DEFAULT_PREFERENCES,
        dayPalette: DayPalette.MUTED,
      }),
    );

    expect(stored.payload.dayPalette).toBe(DayPalette.MUTED);
  });

  it("should migrate version 6 to Vivid and keep the rest", () => {
    const loaded = deserializePreferencesDocument(
      JSON.stringify({
        schemaVersion: VERSION_BEFORE_DAY_PALETTE,
        payload: version6Payload,
      }),
      null,
    );

    expect(loaded).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        dayPalette: DayPalette.VIVID,
        dayColouring: "WORKING_HOURS",
        theme: "DARK",
        workingHours: { start: "08:00", end: "17:00" },
      },
    });
  });
});
