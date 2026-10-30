import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useReferenceMoment } from "@/controller";
import { CalendarDialog } from "./CalendarDialog";

const NOW_ICON_SIZE_PX = 16;

const arrowButtonClassName =
  // Stryker disable next-line StringLiteral: the arrow classes are checked by the "Touch targets" scenario of date_selection_layout_e2e.feature
  "flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * The bottom bar of the main page: previous day, the shown date opening the
 * calendar, next day and Now (active while pinned, inactive while live). Shared by every view.
 * Implements FR2, FR3, FR4, FR6, FR7, NFR-A2, NFR-A3, NFR-R2, UX1, UX2, UX3 of
 * select-date-with-calendar-and-now (D6).
 * Implements FR1, FR2, FR3, FR4, NFR-A1 of keep-now-button-visible-when-live
 * (D1, D2).
 */
export function DateBar() {
  const { t } = useTranslation();
  const {
    dateBar,
    announcement,
    showPreviousDay,
    showNextDay,
    selectDate,
    returnToNow,
  } = useReferenceMoment();
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  const handleReturnToNow = () => {
    returnToNow();
    dateButtonRef.current?.focus();
  };

  return (
    <div role="group" aria-label={t("date.barLabel")} className="px-4 py-2">
      <div className="flex items-center justify-between gap-2 md:justify-center md:gap-4">
        <div className="flex items-center">
          <button
            type="button"
            aria-label={t("date.previousDay")}
            className={arrowButtonClassName}
            onClick={showPreviousDay}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <CalendarDialog
            ref={dateButtonRef}
            dateBar={dateBar}
            onSelectDate={selectDate}
          />
          <button
            type="button"
            aria-label={t("date.nextDay")}
            className={arrowButtonClassName}
            onClick={showNextDay}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          disabled={!dateBar.isPinned}
          className="flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:bg-muted disabled:text-muted-foreground"
          onClick={handleReturnToNow}
        >
          <Clock aria-hidden="true" size={NOW_ICON_SIZE_PX} />
          {t("date.now")}
        </button>
      </div>
      {dateBar.gapNote && (
        <p className="pt-1 text-center text-xs text-muted-foreground">
          {dateBar.gapNote}
        </p>
      )}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
