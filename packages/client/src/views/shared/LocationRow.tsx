import { X } from "lucide-react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { LocationRow as LocationRowModel } from "@/presenter";

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
};

/**
 * One location: city, country, UTC offset and its remove action.
 * Implements FR10, UX4 of add-locations-via-search (D10).
 * Implements FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow({ row, onRemove }, removeButtonRef) {
    const { t } = useTranslation();
    const hasSecondaryLine =
      row.countryName !== "" || row.utcOffsetLabel !== "";
    return (
      <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3">
        <span className="flex flex-col">
          <span className="font-semibold">{row.cityLabel}</span>
          {hasSecondaryLine && (
            <span className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
              {row.countryName !== "" && <span>{row.countryName}</span>}
              {row.utcOffsetLabel !== "" && <span>{row.utcOffsetLabel}</span>}
            </span>
          )}
        </span>
        <button
          ref={removeButtonRef}
          type="button"
          aria-label={t("locations.removeLocation", { city: row.cityLabel })}
          onClick={() => onRemove(row.id)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X aria-hidden="true" />
        </button>
      </li>
    );
  },
);
