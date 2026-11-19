import { Plus } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ADD_LOCATION_BUTTON_ID,
  HEADER_ICON_SIZE_PX,
  KeyboardKey,
} from "@/constants";

/**
 * The action that opens the location search; also the dialog trigger. It shows
 * "+" on every width; the accessible name is always
 * "Add location".
 * Implements FR17 of add-locations-via-search (D10) and NFR-A1 of
 * open-location-search-with-slash-shortcut (D4).
 * Implements FR2, FR16 of add-settings-page-and-device-time-location (D11).
 * Implements FR3, FR4, UX2 of fix-location-card-and-header-layout (D3): "+" at
 * the left of the header on every width.
 * Implements FR6, UX4 of redesign-cards-grid-and-day-palettes (D4): at the right of the header, 27 px icon in a 44 px target.
 */
export const AddLocationButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function AddLocationButton(props, buttonRef) {
  const { t } = useTranslation();
  return (
    <button
      ref={buttonRef}
      id={ADD_LOCATION_BUTTON_ID}
      type="button"
      className="flex h-11 w-11 items-center justify-center rounded-md font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={t("locations.addLocation")}
      aria-keyshortcuts={KeyboardKey.SLASH}
      {...props}
    >
      <Plus aria-hidden="true" size={HEADER_ICON_SIZE_PX} />
    </button>
  );
});
