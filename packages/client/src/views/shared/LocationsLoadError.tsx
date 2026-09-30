import { useTranslation } from "react-i18next";

type LocationsLoadErrorProps = {
  onReset: () => void;
};

/**
 * The saved list cannot be read; Reset replaces it with an empty one.
 * Implements FR12 of add-locations-via-search (D10).
 */
export function LocationsLoadError({ onReset }: LocationsLoadErrorProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-8 text-danger">
      <p>{t("locations.loadError")}</p>
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 rounded-md border border-border px-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {t("locations.reset")}
      </button>
    </div>
  );
}
