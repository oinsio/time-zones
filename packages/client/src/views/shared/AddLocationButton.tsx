import { Plus } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ADD_LOCATION_BUTTON_ID, KeyboardKey } from "@/constants";

/**
 * The action that opens the location search; also the dialog trigger. It shows
 * "+" below 768 px and "+ Add" from it; the accessible name is always
 * "Add location".
 * Implements FR17 of add-locations-via-search (D10) and NFR-A1 of
 * open-location-search-with-slash-shortcut (D4).
 * Implements FR2, FR16 of add-settings-page-and-device-time-location (D11).
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
      className="order-1 col-start-1 flex min-h-11 min-w-11 justify-self-start md:order-2 items-center justify-center gap-2 rounded-md border border-transparent px-3 font-semibold md:border-border md:bg-surface text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={t("locations.addLocation")}
      aria-keyshortcuts={KeyboardKey.SLASH}
      {...props}
    >
      <Plus aria-hidden="true" />
      <span className="hidden md:inline">{t("locations.addShort")}</span>
    </button>
  );
});
