import { useTranslation } from "react-i18next";
import type { PresentedSearchResult } from "@/presenter";
import { cn } from "@/shared/lib/cn";

type LocationSearchResultsProps = {
  listboxId: string;
  optionIdPrefix: string;
  results: readonly PresentedSearchResult[];
  activeIndex: number;
  onChoose: (result: PresentedSearchResult) => void;
};

/**
 * The listbox of search results; added results are disabled and marked.
 * Implements FR5, FR8, UX3 of add-locations-via-search (D10).
 */
export function LocationSearchResults({
  listboxId,
  optionIdPrefix,
  results,
  activeIndex,
  onChoose,
}: LocationSearchResultsProps) {
  const { t } = useTranslation();
  return (
    <ul id={listboxId} role="listbox" className="flex flex-col gap-1">
      {results.map((result, resultIndex) => (
        <li
          key={`${result.timeZoneId}-${result.cityName}`}
          id={`${optionIdPrefix}${resultIndex}`}
          role="option"
          aria-selected={resultIndex === activeIndex}
          aria-disabled={result.isAdded}
          onClick={() => !result.isAdded && onChoose(result)}
          className={cn(
            "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2",
            resultIndex === activeIndex && "border-border bg-muted",
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
        </li>
      ))}
    </ul>
  );
}
