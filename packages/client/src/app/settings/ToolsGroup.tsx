import { useTranslation } from "react-i18next";
import { usePreferences } from "@/controller";
import { type ToolDefinition, toolRegistry } from "@/tools";
import { SettingsToggleGroup } from "@/views/shared";

type ToolsGroupProps = {
  /** The registry the group lists; tests pass their own. */
  registry?: readonly ToolDefinition[];
};

/**
 * The tools group: one icon toggle per registered tool, off until the user
 * turns it on. It renders nothing for an empty registry.
 * Implements FR1, FR2, UX2 of add-unix-time-converter-tool (D3).
 */
export function ToolsGroup({ registry = toolRegistry }: ToolsGroupProps) {
  const { t } = useTranslation();
  const { preferences, setToolEnabled } = usePreferences();
  if (registry.length === 0) return null;
  return (
    <SettingsToggleGroup
      caption={t("tools.groupLabel")}
      options={registry.map((tool) => ({
        value: tool.id,
        label: t(tool.titleKey),
        icon: tool.icon,
      }))}
      selectedValues={preferences.enabledTools}
      onToggle={setToolEnabled}
    />
  );
}
