import type { ToolDefinition } from "./toolDefinition";

/**
 * The registered tools the user turned on, in registry order. Ids that are not
 * registered are ignored, so a tool removed from the registry needs no
 * migration and a tool stored by a newer build survives an older one.
 * Implements FR1, FR3 of add-unix-time-converter-tool (D1).
 */
export function resolveEnabledTools(
  registry: readonly ToolDefinition[],
  enabledTools: readonly string[],
): readonly ToolDefinition[] {
  return registry.filter((tool) => enabledTools.includes(tool.id));
}
