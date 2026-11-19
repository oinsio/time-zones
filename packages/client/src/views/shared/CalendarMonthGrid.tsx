import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarMove, useCalendarMonth } from "@/controller";
import { getCalendarMoveForKey } from "./calendarKeys";

const DAY_ATTRIBUTE = "data-iso-date";

const iconButtonClassName =
  "flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

type CalendarMonthGridProps = {
  /** The ISO date the calendar opens on. */
  isoDate: string;
  /** Reports the picked ISO date. */
  onSelectDate: (isoDate: string) => void;
};

/**
 * The month of the calendar: previous and next month buttons, the grid of days
 * and the keyboard moves between days. It holds the focused day and puts the
 * focus on it when it opens, so it loads with the calendar and not with the page.
 * Implements FR3, FR9, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 of
 * select-date-with-calendar-and-now (D6).
 * Implements NFR-P2 of redesign-cards-grid-and-day-palettes (D4): split from `CalendarDialog`
 * so the initial JavaScript stays within its budget.
 */
export default function CalendarMonthGrid({
  isoDate,
  onSelectDate,
}: CalendarMonthGridProps) {
  const { t } = useTranslation();
  const [focusedIsoDate, setFocusedIsoDate] = useState(isoDate);
  const { month, getFocusTarget } = useCalendarMonth(focusedIsoDate);
  const gridRef = useRef<HTMLTableElement>(null);

  // The day takes the focus when the month opens and when a key moves it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the focused day changes
  useEffect(() => {
    gridRef.current
      ?.querySelector<HTMLElement>(`[${DAY_ATTRIBUTE}="${focusedIsoDate}"]`)
      ?.focus();
  }, [focusedIsoDate]);

  // Stryker disable all: not equivalent — keyboard handling is untested in jsdom by design (D8), covered by date_selection_e2e.feature
  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const move = getCalendarMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    setFocusedIsoDate(getFocusTarget(move));
  };
  // Stryker restore all

  return (
    <>
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
    </>
  );
}
