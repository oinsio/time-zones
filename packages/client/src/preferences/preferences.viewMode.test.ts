// Verifies FR3, FR4 of add-view-mode-setting-and-grid-skeleton.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  PreferencesCommandType,
  parseStoredPreferences,
  reducePreferences,
} from ".";

function parseViewMode(viewMode: unknown) {
  return parseStoredPreferences({
    theme: "DARK",
    hourFormat: "H12",
    interfaceLanguage: null,
    zoneLabelParts: [],
    viewMode,
  });
}

describe("view mode preference", () => {
  it("should default to none chosen", () => {
    expect(DEFAULT_PREFERENCES.viewMode).toBeNull();
  });

  it("should set the chosen view", () => {
    const next = reducePreferences(DEFAULT_PREFERENCES, {
      type: PreferencesCommandType.SET_VIEW_MODE,
      viewMode: "grid",
    });
    expect(next.viewMode).toBe("grid");
  });

  it("should return the same object for an unchanged view", () => {
    const chosen = { ...DEFAULT_PREFERENCES, viewMode: "grid" };
    const next = reducePreferences(chosen, {
      type: PreferencesCommandType.SET_VIEW_MODE,
      viewMode: "grid",
    });
    expect(next).toBe(chosen);
  });

  it.each([null, "grid", "timeline"])("should accept %s", (viewMode) => {
    const parsed = parseViewMode(viewMode);
    expect(parsed.ok && parsed.preferences.viewMode).toBe(viewMode);
  });

  it.each([undefined, "", 42, {}])("should reject %j", (viewMode) => {
    expect(parseViewMode(viewMode)).toEqual({ ok: false });
  });
});
