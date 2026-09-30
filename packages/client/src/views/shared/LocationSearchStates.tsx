import { useTranslation } from "react-i18next";
import { CitySearchStatus } from "@/controller";

type LocationSearchStatesProps = {
  status: CitySearchStatus;
  hasQuery: boolean;
  hasResults: boolean;
  onRetry: () => void;
};

/**
 * What the search shows instead of results: loading, load error with Retry,
 * or no matches with a hint. Renders nothing when results are shown.
 * Implements FR6, FR15, UX1, UX2 of add-locations-via-search (D10).
 */
export function LocationSearchStates({
  status,
  hasQuery,
  hasResults,
  onRetry,
}: LocationSearchStatesProps) {
  const { t } = useTranslation();
  if (status === CitySearchStatus.LOADING) {
    return (
      <p aria-busy="true" className="animate-pulse py-4 text-muted-foreground">
        {t("locations.searchLoading")}
      </p>
    );
  }
  if (status === CitySearchStatus.FAILED) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 py-4 text-danger"
      >
        <p>{t("locations.searchLoadError")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-md border border-border px-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {t("locations.retry")}
        </button>
      </div>
    );
  }
  if (hasQuery && !hasResults) {
    return (
      <div className="py-4">
        <p>{t("locations.noResults")}</p>
        <p className="text-sm text-muted-foreground">
          {t("locations.noResultsHint")}
        </p>
      </div>
    );
  }
  return null;
}
