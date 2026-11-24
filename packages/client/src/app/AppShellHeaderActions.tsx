import type { RefCallback } from "react";
import type { ToolDefinition } from "@/tools";
import { LocationSearch } from "@/views/shared";
import { SettingsButton } from "./SettingsButton";
import { ToolButtons } from "./ToolButtons";
import { SETTINGS_OPENER_KEY } from "./useAppPage";

type AppShellHeaderActionsProps = {
  isLocationSearchShown: boolean;
  enabledTools: readonly ToolDefinition[];
  onOpenTool: (toolId: string) => void;
  onOpenSettings: () => void;
  getOpenerRef: (key: string) => RefCallback<HTMLButtonElement>;
};

/**
 * The header buttons of the main page, in Tab order: Add location, the tool
 * buttons in registry order, Settings.
 * Implements FR4, NFR-A4 of add-unix-time-converter-tool (D2).
 */
export function AppShellHeaderActions({
  isLocationSearchShown,
  enabledTools,
  onOpenTool,
  onOpenSettings,
  getOpenerRef,
}: AppShellHeaderActionsProps) {
  return (
    <>
      {isLocationSearchShown && <LocationSearch />}
      <ToolButtons
        tools={enabledTools}
        onOpenTool={onOpenTool}
        getOpenerRef={getOpenerRef}
      />
      <SettingsButton
        ref={getOpenerRef(SETTINGS_OPENER_KEY)}
        onClick={onOpenSettings}
      />
    </>
  );
}
