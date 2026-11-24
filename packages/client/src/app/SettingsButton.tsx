import { Settings } from "lucide-react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { HeaderIconButton } from "./HeaderIconButton";

type SettingsButtonProps = { onClick: () => void };

/**
 * The header button that opens the settings page, in the top right corner.
 * Implements FR1, UX1 of add-settings-page-and-device-time-location (D11).
 * Implements FR3, FR4, UX2 of fix-location-card-and-header-layout (D3): one
 * header layout on every width.
 * Implements FR6, UX4 of redesign-cards-grid-and-day-palettes (D4): the gear (Lucide `Settings`).
 * Implements FR4, UX3 of add-unix-time-converter-tool (D2): the body is `HeaderIconButton`.
 */
export const SettingsButton = forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>(function SettingsButton({ onClick }, buttonRef) {
  const { t } = useTranslation();
  return (
    <HeaderIconButton
      ref={buttonRef}
      label={t("settings.open")}
      icon={Settings}
      onClick={onClick}
    />
  );
});
