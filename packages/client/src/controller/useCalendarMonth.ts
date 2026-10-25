import { useContext, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { FIRST_DAY_OF_WEEK_BY_LANGUAGE } from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import { Temporal } from "@/lib/temporal";
import {
  type CalendarMove,
  getCalendarFocusTarget,
  getEffectiveInstant,
  getReferenceZone,
} from "@/model";
import { presentCalendarMonth } from "@/presenter";
import { LocationsContext } from "./locationsContext";

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
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ??
    i18n.language) as SupportedLanguage;

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
      FIRST_DAY_OF_WEEK_BY_LANGUAGE[language],
    ).toString();

  return { month, getFocusTarget };
}
