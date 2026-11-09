import { useTranslation } from "react-i18next";
import { usePreferences, useViewMode } from "@/controller";
import { resolveActiveView, viewRegistry } from "@/views";
import { SettingsOptionGroup } from "./SettingsOptionGroup";

/**
 * The view group of the settings: one option per registered view, by name, in
 * registry order. The checked option is the view the host shows, so Cards
 * is checked when none is chosen or the stored view is not registered.
 * Implements FR1, FR2, FR3, FR4, NFR-A1, UX1 of add-view-mode-setting-and-grid-skeleton (D2).
 */
export function ViewModeGroup() {
  const { t } = useTranslation();
  const { setViewMode } = usePreferences();
  const activeView = resolveActiveView(viewRegistry, useViewMode());
  if (activeView === undefined) return null;
  return (
    <SettingsOptionGroup
      caption={t("settings.viewModeLabel")}
      options={viewRegistry.map((view) => ({
        value: view.id,
        label: t(view.titleKey),
      }))}
      selectedValue={activeView.id}
      onSelect={setViewMode}
    />
  );
}
