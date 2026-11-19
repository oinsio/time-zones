import { lazy, Suspense } from "react";

/** The month grid loads when the calendar opens: it is not needed for the first paint and the initial JavaScript is budgeted (NFR-P2). */
const CalendarMonthGrid = lazy(() => import("./CalendarMonthGrid"));

type LazyCalendarMonthGridProps = {
  isoDate: string;
  onSelectDate: (isoDate: string) => void;
};

/**
 * The calendar month, loaded when the calendar dialog opens.
 * Implements NFR-P2 of redesign-cards-grid-and-day-palettes (D4).
 */
export function LazyCalendarMonthGrid(props: LazyCalendarMonthGridProps) {
  return (
    <Suspense fallback={null}>
      <CalendarMonthGrid {...props} />
    </Suspense>
  );
}
