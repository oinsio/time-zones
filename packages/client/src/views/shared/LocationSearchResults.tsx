import { useTranslation } from "react-i18next";
import type { PresentedSearchResult } from "@/presenter";
import { cn } from "@/shared/lib/cn";

type LocationSearchResultsProps = {
  listboxId: string;
  optionIdPrefix: string;
  results: readonly PresentedSearchResult[];
  /** Shown as the first option when present. */
  deviceTimeOption?: { label: string; onChoose: () => void };
  activeIndex: number;
  onChoose: (result: PresentedSearchResult) => void;
};

/**
 * The listbox of search results; added results are disabled and marked.
 * Implements FR5, FR8, UX3 of add-locations-via-search (D10).
 * Implements FR11 of add-settings-page-and-device-time-location (D12): the
 * Device time option comes first.
 */
export function LocationSearchResults({
  listboxId,
  optionIdPrefix,
  results,
  deviceTimeOption,
  activeIndex,
  onChoose,
}: LocationSearchResultsProps) {
  const { t } = useTranslation();
  const optionOffset = deviceTimeOption ? 1 : 0;
  return (
    <div id={listboxId} role="listbox" className="flex flex-col gap-1">
      {deviceTimeOption && (
        <div
          id={`${optionIdPrefix}0`}
          role="option"
          tabIndex={-1}
          aria-selected={activeIndex === 0}
          onClick={deviceTimeOption.onChoose}
          className={cn(
            "flex min-h-11 cursor-pointer items-center rounded-md border border-transparent px-3 py-2 font-semibold",
            activeIndex === 0 && "border-border bg-background",
          )}
        >
          {deviceTimeOption.label}
        </div>
      )}
      {results.map((result, resultPosition) => (
        <div
          key={`${result.timeZoneId}-${result.cityName}`}
          id={`${optionIdPrefix}${resultPosition + optionOffset}`}
          role="option"
          tabIndex={-1}
          aria-selected={resultPosition + optionOffset === activeIndex}
          aria-disabled={result.isAdded}
          onClick={() => !result.isAdded && onChoose(result)}
          className={cn(
            "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2",
            resultPosition + optionOffset === activeIndex &&
              "border-border bg-background",
            result.isAdded && "cursor-default text-muted-foreground",
          )}
        >
          <span className="flex flex-col">
            <span className="font-semibold">
              {result.cityName}
              {result.matchedAbbreviation !== undefined && (
                <span className="ml-2 font-normal text-muted-foreground">
                  {result.matchedAbbreviation}
                </span>
              )}
            </span>
            {result.countryName !== "" && (
              <span className="text-sm text-muted-foreground">
                {result.countryName}
              </span>
            )}
          </span>
          {result.isAdded && (
            <span className="text-sm">{t("locations.added")}</span>
          )}
        </div>
      ))}
    </div>
  );
}
