import { Plus } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardKey } from "@/constants";

/**
 * The action that opens the location search; also the dialog trigger.
 * Implements FR17 of add-locations-via-search (D10) and NFR-A1 of
 * open-location-search-with-slash-shortcut (D4).
 */
export const AddLocationButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function AddLocationButton(props, buttonRef) {
  const { t } = useTranslation();
  return (
    <button
      ref={buttonRef}
      type="button"
      className="mx-auto flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      aria-keyshortcuts={KeyboardKey.SLASH}
      {...props}
    >
      <Plus aria-hidden="true" />
      {t("locations.addLocation")}
    </button>
  );
});
