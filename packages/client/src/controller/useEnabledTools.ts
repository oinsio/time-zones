import { useContext } from "react";
import { DEFAULT_PREFERENCES } from "@/preferences";
import {
  resolveEnabledTools,
  type ToolDefinition,
  toolRegistry,
} from "@/tools";
import { PreferencesContext } from "./preferencesContext";

/**
 * The registered tools the user turned on, in registry order. Outside a
 * `PreferencesProvider` (a bare hook under test) none is on.
 * Implements FR1, FR3, FR4 of add-unix-time-converter-tool (D1).
 */
export function useEnabledTools(
  registry: readonly ToolDefinition[] = toolRegistry,
): readonly ToolDefinition[] {
  const context = useContext(PreferencesContext);
  return resolveEnabledTools(
    registry,
    (context?.preferences ?? DEFAULT_PREFERENCES).enabledTools,
  );
}
