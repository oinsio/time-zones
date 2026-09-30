import { X } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui";
import { KeyboardKey } from "@/constants";
import { CitySearchStatus } from "@/controller";
import type { PresentedSearchResult } from "@/presenter";
import { LocationSearchResults } from "./LocationSearchResults";
import { LocationSearchStates } from "./LocationSearchStates";

const FIRST_OPTION_INDEX = 0;

type LocationSearchDialogProps = {
  isOpen: boolean;
  status: CitySearchStatus;
  presentedResults: readonly PresentedSearchResult[];
  query: string;
  onQueryChange: (query: string) => void;
  onChoose: (result: PresentedSearchResult) => void;
  onRetry: () => void;
  onClose: () => void;
  onCloseAutoFocus?: (event: Event) => void;
};

/**
 * The search overlay: a combobox over a listbox of presented results. It
 * receives presenter output and callbacks only.
 * Implements FR5–FR8, FR15, UX1–UX3, NFR-A2 of add-locations-via-search (D10).
 */
export function LocationSearchDialog({
  isOpen,
  status,
  presentedResults,
  query,
  onQueryChange,
  onChoose,
  onRetry,
  onClose,
  onCloseAutoFocus,
}: LocationSearchDialogProps) {
  const { t } = useTranslation();
  const listboxId = useId();
  const optionIdPrefix = `${listboxId}-option-`;
  const [activeIndex, setActiveIndex] = useState(FIRST_OPTION_INDEX);
  const hasQuery = query.trim() !== "";
  const isReady = status === CitySearchStatus.READY;
  const lastIndex = presentedResults.length - 1;
  const activeOptionIndex = Math.min(activeIndex, lastIndex);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === KeyboardKey.ARROW_DOWN) {
      event.preventDefault();
      setActiveIndex(Math.min(activeOptionIndex + 1, lastIndex));
    } else if (event.key === KeyboardKey.ARROW_UP) {
      event.preventDefault();
      setActiveIndex(Math.max(activeOptionIndex - 1, FIRST_OPTION_INDEX));
    } else if (event.key === KeyboardKey.ENTER) {
      const activeResult = presentedResults[activeOptionIndex];
      if (activeResult && !activeResult.isAdded) onChoose(activeResult);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isNowOpen) => !isNowOpen && onClose()}>
      <DialogContent aria-describedby={undefined} onCloseAutoFocus={onCloseAutoFocus}>
        <div className="flex items-center justify-between gap-3">
          <DialogTitle className="text-lg font-semibold">
            {t("locations.searchTitle")}
          </DialogTitle>
          <DialogClose
            aria-label={t("locations.close")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X aria-hidden="true" />
          </DialogClose>
        </div>
        <input
          type="text"
          role="combobox"
          aria-label={t("locations.searchLabel")}
          aria-expanded={presentedResults.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeOptionIndex >= FIRST_OPTION_INDEX
              ? `${optionIdPrefix}${activeOptionIndex}`
              : undefined
          }
          placeholder={t("locations.searchPlaceholder")}
          value={query}
          onChange={(event) => {
            setActiveIndex(FIRST_OPTION_INDEX);
            onQueryChange(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="min-h-11 rounded-md border border-border bg-surface px-3 text-foreground"
        />
        <LocationSearchStates
          status={status}
          hasQuery={hasQuery}
          hasResults={presentedResults.length > 0}
          onRetry={onRetry}
        />
        {isReady && !hasQuery && presentedResults.length > 0 && (
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t("locations.suggestionsHeading")}
          </h3>
        )}
        {isReady && presentedResults.length > 0 && (
          <LocationSearchResults
            listboxId={listboxId}
            optionIdPrefix={optionIdPrefix}
            results={presentedResults}
            activeIndex={activeOptionIndex}
            onChoose={onChoose}
          />
        )}
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {isReady && hasQuery
            ? t("locations.resultCount", { count: presentedResults.length })
            : ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}
