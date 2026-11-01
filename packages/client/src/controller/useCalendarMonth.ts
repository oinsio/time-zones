import { useContext, useMemo, useSyncExternalStore } from "react";
import { Temporal } from "@/lib/temporal";
import {
  type CalendarMove,
  getCalendarFocusTarget,
  getEffectiveInstant,
  getReferenceZone,
} from "@/model";
import { presentCalendarMonth, resolveFirstDayOfWeek } from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";

const MISSING_PROVIDER_MESSAGE =
  "useCalendarMonth must be used inside a LocationsProvider";

/**
 * The month of the focused day for the calendar, with the selected and today
 * marks of the reference zone, and the day the focus moves to on a key.
 * Implements FR3, FR9 of select-date-with-calendar-and-now (D5).
 */
export function useCalendarMonth(focusedIsoDate: string) {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, minuteTick } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { code: language } = useActiveInterfaceLanguage();

  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick keeps "today" current
  const month = useMemo(() => {
    const now = clock.instant();
    const zone = getReferenceZone(state);
    return presentCalendarMonth({
      focusedDate: Temporal.PlainDate.from(focusedIsoDate),
      selectedDate: getEffectiveInstant(state, now)
        .toZonedDateTimeISO(zone)
        .toPlainDate(),
      today: now.toZonedDateTimeISO(zone).toPlainDate(),
      language,
    });
  }, [state, clock, focusedIsoDate, language, minuteTick]);

  const getFocusTarget = (move: CalendarMove): string =>
    getCalendarFocusTarget(
      Temporal.PlainDate.from(focusedIsoDate),
      move,
      resolveFirstDayOfWeek(language),
    ).toString();

  return { month, getFocusTarget };
}
