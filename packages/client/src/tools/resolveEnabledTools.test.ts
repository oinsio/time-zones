// Verifies FR1, FR3 of add-unix-time-converter-tool.

import { Binary } from "lucide-react";
import { describe, expect, it } from "vitest";
import { resolveEnabledTools } from "./resolveEnabledTools";
import type { ToolDefinition } from "./toolDefinition";

const toolA: ToolDefinition = { id: "a", titleKey: "a", icon: Binary };
const toolB: ToolDefinition = { id: "b", titleKey: "b", icon: Binary };

describe("resolveEnabledTools", () => {
  it.each([
    [
      "registry order, not stored order",
      [toolA, toolB],
      ["b", "a"],
      [toolA, toolB],
    ],
    ["only the enabled tools", [toolA, toolB], ["b"], [toolB]],
    ["no tool when none is enabled", [toolA, toolB], [], []],
    ["no tool for an unregistered id", [toolA], ["folders", "a"], [toolA]],
    ["no tool for an empty registry", [], ["a"], []],
  ])("should return %s", (_name, registry, enabledTools, expected) => {
    expect(resolveEnabledTools(registry, enabledTools)).toEqual(expected);
  });
});
