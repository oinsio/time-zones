import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { PresentedSearchResult } from "@/presenter";
import { cn } from "@/shared/lib/cn";

const ABBREVIATION_PAIR_SEPARATOR = " / ";
const REGION_COUNTRY_SEPARATOR = ", ";

type LocationSearchResultsProps = {
  listboxId: string;
  optionIdPrefix: string;
  results: readonly PresentedSearchResult[];
  /** Shown as the first option when present. */
  deviceTimeOption?: { label: string; onChoose: () => void };
  activeIndex: number;
  onChoose: (result: PresentedSearchResult) => void;
};

/** The region, then the country; the country alone without a region. */
const secondaryLine = (result: PresentedSearchResult): string =>
  [result.regionName, result.countryName]
    .filter((part) => part !== undefined && part !== "")
    .join(REGION_COUNTRY_SEPARATOR);

/**
 * The listbox of search results; added results are disabled and marked.
 * Implements FR5, FR8, UX3 of add-locations-via-search (D10).
 * Implements FR11 of add-settings-page-and-device-time-location (D12): the
 * Device time option comes first.
 * Implements FR10, FR11, NFR-A2, UX3 of show-zone-abbreviations-and-zone-label-setting (D8): the abbreviation pair, the matched one bold.
 * Implements FR4, FR7, UX1, NFR-A1 of add-geonames-city-source (D9): options keyed by result ID, the region on the secondary line.
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
          key={result.id}
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
              {result.abbreviationPair !== undefined && (
                <span className="ml-2">
                  {result.abbreviationPair.map((abbreviation, position) => (
                    <Fragment key={abbreviation.text}>
                      {position > 0 && ABBREVIATION_PAIR_SEPARATOR}
                      <span
                        data-matched={abbreviation.isMatched || undefined}
                        className={
                          abbreviation.isMatched
                            ? "font-bold text-foreground"
                            : "font-normal text-muted-foreground"
                        }
                      >
                        {abbreviation.text}
                      </span>
                    </Fragment>
                  ))}
                </span>
              )}
            </span>
            {secondaryLine(result) !== "" && (
              <span className="break-words text-sm text-muted-foreground">
                {secondaryLine(result)}
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
