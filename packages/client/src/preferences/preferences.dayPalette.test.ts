// Verifies FR3 of redesign-cards-grid-and-day-palettes.
import { describe, expect, it } from "vitest";
import { DAY_PALETTE_ORDER } from "@/constants";
import {
  DayPalette,
  DEFAULT_PREFERENCES,
  PreferencesCommandType,
  parseStoredPreferences,
  reducePreferences,
} from ".";

const storedPayload = (dayPalette: unknown) => ({
  theme: "DARK",
  hourFormat: "H12",
  interfaceLanguage: null,
  zoneLabelParts: ["UTC_OFFSET"],
  viewMode: null,
  dayColouring: "TIME_OF_DAY",
  workingHours: { start: "09:00", end: "18:00" },
  dayPalette,
  shareLanguage: null,
  shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
  enabledTools: [],
});

describe("the day palette defaults", () => {
  it("should default to Vivid", () => {
    expect(DEFAULT_PREFERENCES.dayPalette).toBe(DayPalette.VIVID);
  });

  it("should list Vivid, Muted in that order", () => {
    expect(DAY_PALETTE_ORDER).toEqual([DayPalette.VIVID, DayPalette.MUTED]);
  });
});

describe("SET_DAY_PALETTE", () => {
  it("should set the palette", () => {
    const changed = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_DAY_PALETTE,
      dayPalette: DayPalette.MUTED,
    });

    expect(changed.dayPalette).toBe(DayPalette.MUTED);
  });

  it("should return the same object when the palette is unchanged", () => {
    const unchanged = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_DAY_PALETTE,
      dayPalette: DayPalette.VIVID,
    });

    expect(unchanged).toBe(DEFAULT_PREFERENCES);
  });
});

describe("parseStoredPreferences with a day palette", () => {
  it.each([DayPalette.VIVID, DayPalette.MUTED])(
    "should accept %s",
    (palette) => {
      const parsed = parseStoredPreferences(storedPayload(palette));

      expect(parsed).toMatchObject({
        ok: true,
        preferences: { dayPalette: palette },
      });
    },
  );

  it.each(["PASTEL", undefined, null, 1])("should reject %s", (palette) => {
    expect(parseStoredPreferences(storedPayload(palette))).toEqual({
      ok: false,
    });
  });
});
