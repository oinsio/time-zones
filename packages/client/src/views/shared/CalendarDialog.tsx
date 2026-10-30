import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { CalendarMove, useCalendarMonth } from "@/controller";
import type { PresentedDateBar } from "@/presenter";
import { getCalendarMoveForKey } from "./calendarKeys";

const DAY_ATTRIBUTE = "data-iso-date";

type CalendarDialogProps = {
  dateBar: PresentedDateBar;
  onSelectDate: (isoDate: string) => void;
};

const iconButtonClassName =
  "flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * The calendar opened by the shown date: a modal grid of the month with
 * previous and next month buttons and keyboard moves between days. View state
 * (open, focused day) stays here; picking reports the ISO date.
 * Implements FR3, FR9, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 of
 * select-date-with-calendar-and-now (D6).
 * Implements NFR-R1, UX2 of keep-now-button-visible-when-live.
 */
export const CalendarDialog = forwardRef<
  HTMLButtonElement,
  CalendarDialogProps
>(function CalendarDialog({ dateBar, onSelectDate }, triggerRef) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIsoDate, setFocusedIsoDate] = useState(dateBar.isoDate);
  const { month, getFocusTarget } = useCalendarMonth(focusedIsoDate);
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocusDayRef = useRef(false);

  const focusDay = () =>
    gridRef.current
      ?.querySelector<HTMLElement>(`[${DAY_ATTRIBUTE}="${focusedIsoDate}"]`)
      ?.focus();

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the focused day changes by a key
  useEffect(() => {
    if (!shouldFocusDayRef.current) return;
    // Stryker disable next-line BooleanLiteral: not equivalent — keyboard focus is untested in jsdom by design (D8), covered by date_selection_e2e.feature
    shouldFocusDayRef.current = false;
    focusDay();
  }, [focusedIsoDate]);

  const handleOpenChange = (isNowOpen: boolean) => {
    if (isNowOpen) setFocusedIsoDate(dateBar.isoDate);
    setIsOpen(isNowOpen);
  };

  // Stryker disable all: not equivalent — keyboard handling is untested in jsdom by design (D8), covered by date_selection_e2e.feature
  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const move = getCalendarMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    shouldFocusDayRef.current = true;
    setFocusedIsoDate(getFocusTarget(move));
  };
  // Stryker restore all

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-label={dateBar.chooseDateLabel}
          className="flex min-h-11 items-center rounded-md px-2 text-base font-semibold md:w-72 md:justify-center md:whitespace-nowrap text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          focusDay();
        }}
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
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label={t("date.previousMonth")}
            className={iconButtonClassName}
            onClick={() =>
              setFocusedIsoDate(getFocusTarget(CalendarMove.PREVIOUS_MONTH))
            }
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <h3 aria-live="polite" className="font-semibold">
            {month.heading}
          </h3>
          <button
            type="button"
            aria-label={t("date.nextMonth")}
            className={iconButtonClassName}
            onClick={() =>
              setFocusedIsoDate(getFocusTarget(CalendarMove.NEXT_MONTH))
            }
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <table
          ref={gridRef}
          // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA date-picker grid pattern (design D6)
          role="grid"
          aria-label={month.heading}
          className="w-full table-fixed border-collapse"
          onKeyDown={handleKeyDown}
        >
          <thead>
            <tr>
              {month.weekdays.map((weekday) => (
                <th
                  key={weekday.fullLabel}
                  scope="col"
                  abbr={weekday.fullLabel}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {weekday.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {month.weeks.map((week) => (
              <tr key={week.find((cell) => cell !== null)?.isoDate}>
                {week.map((cell, cellIndex) => (
                  <td
                    key={cell?.isoDate ?? cellIndex}
                    aria-selected={cell?.isSelected || undefined}
                    className="p-0 text-center"
                  >
                    {cell && (
                      <button
                        type="button"
                        {...{ [DAY_ATTRIBUTE]: cell.isoDate }}
                        aria-label={cell.fullLabel}
                        aria-current={cell.isToday ? "date" : undefined}
                        tabIndex={cell.isFocused ? 0 : -1}
                        onClick={() => {
                          onSelectDate(cell.isoDate);
                          setIsOpen(false);
                        }}
                        className={`min-h-11 min-w-11 w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                          cell.isSelected
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        } ${cell.isToday ? "font-bold" : ""}`}
                      >
                        {cell.dayNumber}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
});
