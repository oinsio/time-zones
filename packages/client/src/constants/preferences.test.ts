// Verifies FR2, FR4, FR5 of compact-settings-controls.
import { describe, expect, it } from "vitest";
import {
  HOUR_FORMAT_PICTOGRAMS,
  SETTINGS_GROUP_ROW_CLASS_NAME,
  THEME_PREFERENCE_ORDER,
} from "@/constants";
import { HourFormat, ThemePreference } from "@/preferences";

describe("settings display constants", () => {
  it("should order the theme System, Light, Dark", () => {
    expect(THEME_PREFERENCE_ORDER).toEqual([
      ThemePreference.SYSTEM,
      ThemePreference.LIGHT,
      ThemePreference.DARK,
    ]);
  });

  it("should list every theme preference once", () => {
    expect([...THEME_PREFERENCE_ORDER].sort()).toEqual(
      Object.values(ThemePreference).sort(),
    );
  });

  it("should show the hour formats as 12 and 24", () => {
    expect(HOUR_FORMAT_PICTOGRAMS).toEqual({
      [HourFormat.H12]: "12",
      [HourFormat.H24]: "24",
    });
  });

  it.each(["flex-wrap", "justify-between"])(
    "should give the group row the class %s",
    (className) => {
      expect(SETTINGS_GROUP_ROW_CLASS_NAME).toContain(className);
    },
  );
});
