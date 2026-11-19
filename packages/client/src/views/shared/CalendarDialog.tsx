import { X } from "lucide-react";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import type { PresentedDateBar } from "@/presenter";
import { LazyCalendarMonthGrid } from "./LazyCalendarMonthGrid";

type CalendarDialogProps = {
  dateBar: PresentedDateBar;
  onSelectDate: (isoDate: string) => void;
};

const iconButtonClassName =
  "flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * The calendar opened by the shown date: a modal with the month grid, which
 * loads when the dialog opens. View state (open) stays here; picking reports
 * the ISO date.
 * Implements FR3, FR9, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 of
 * select-date-with-calendar-and-now (D6).
 * Implements NFR-R1, UX2 of keep-now-button-visible-when-live.
 * Implements NFR-P2 of redesign-cards-grid-and-day-palettes (D4): the month grid is a lazy chunk.
 */
export const CalendarDialog = forwardRef<
  HTMLButtonElement,
  CalendarDialogProps
>(function CalendarDialog({ dateBar, onSelectDate }, triggerRef) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-label={dateBar.chooseDateLabel}
          className="flex min-h-11 items-center rounded-md px-1 text-base font-bold min-w-28 justify-center md:w-72 md:whitespace-nowrap text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <time dateTime={dateBar.isoDate}>
            <span data-date-label="short" className="md:hidden">
              {dateBar.shortLabel}
            </span>
            <span data-date-label="long" className="hidden md:inline">
              {dateBar.longLabel}
            </span>
          </time>
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="px-1 sm:p-4"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center justify-between gap-3 px-3 sm:px-0">
          <DialogTitle className="text-lg font-semibold">
            {t("date.calendarTitle")}
          </DialogTitle>
          <DialogClose
            aria-label={t("locations.close")}
            className={iconButtonClassName}
          >
            <X aria-hidden="true" />
          </DialogClose>
        </div>
        <LazyCalendarMonthGrid
          isoDate={dateBar.isoDate}
          onSelectDate={(selectedIsoDate) => {
            onSelectDate(selectedIsoDate);
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
});
