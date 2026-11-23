// Verifies FR2, FR3 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  type Preferences,
} from "./preferences";
import {
  PreferencesCommandType,
  reducePreferences,
} from "./preferencesCommands";

const withTools = (enabledTools: string[]): Preferences => ({
  ...DEFAULT_PREFERENCES,
  enabledTools,
});

describe("enabled tools", () => {
  it("should start with no tool enabled", () => {
    expect(DEFAULT_PREFERENCES.enabledTools).toEqual([]);
  });

  it.each([
    ["turns a tool on", [], "a", true, ["a"]],
    ["turns a tool off", ["a", "b"], "a", false, ["b"]],
    ["keeps one entry when turned on twice", ["a"], "a", true, ["a"]],
    [
      "keeps an unregistered id while turning another on",
      ["x"],
      "a",
      true,
      ["x", "a"],
    ],
  ])("should (%s)", (_name, before, toolId, isEnabled, expected) => {
    const after = reducePreferences(withTools(before), {
      type: PreferencesCommandType.TOGGLE_TOOL,
      toolId,
      isEnabled,
    });
    expect(after.enabledTools).toEqual(expected);
  });

  it("should return the same object when turning off a tool that is not on", () => {
    const before = withTools(["a"]);
    const after = reducePreferences(before, {
      type: PreferencesCommandType.TOGGLE_TOOL,
      toolId: "b",
      isEnabled: false,
    });
    expect(after).toBe(before);
  });

  it("should keep the enabled tools through another command", () => {
    const after = reducePreferences(withTools(["unknown"]), {
      type: PreferencesCommandType.SET_HOUR_FORMAT,
      hourFormat: HourFormat.H12,
    });
    expect(after.enabledTools).toEqual(["unknown"]);
  });
});
