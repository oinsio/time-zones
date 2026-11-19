import { Settings } from "lucide-react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { HEADER_ICON_SIZE_PX } from "@/constants";

type SettingsButtonProps = { onClick: () => void };

/**
 * The header button that opens the settings page, in the top right corner.
 * Implements FR1, UX1 of add-settings-page-and-device-time-location (D11).
 * Implements FR3, FR4, UX2 of fix-location-card-and-header-layout (D3): one
 * header layout on every width.
 * Implements FR6, UX4 of redesign-cards-grid-and-day-palettes (D4): the gear (Lucide `Settings`).
 */
export const SettingsButton = forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>(function SettingsButton({ onClick }, buttonRef) {
  const { t } = useTranslation();
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={t("settings.open")}
      className="flex h-11 w-11 items-center justify-center rounded-md text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Settings aria-hidden="true" size={HEADER_ICON_SIZE_PX} />
    </button>
  );
});
