import { X } from "lucide-react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { LocationRow as LocationRowModel } from "@/presenter";

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
};

/**
 * One location: city, country and its remove action.
 * Implements FR10, UX4 of add-locations-via-search (D10).
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow({ row, onRemove }, removeButtonRef) {
    const { t } = useTranslation();
    return (
      <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3">
        <span className="flex flex-col">
          <span className="font-semibold">{row.cityLabel}</span>
          {row.countryName !== "" && (
            <span className="text-sm text-muted-foreground">
              {row.countryName}
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
