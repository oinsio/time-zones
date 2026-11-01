import { useContext, useMemo, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { ONE_DAY } from "@/constants";
import type { Clock } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  getEffectiveInstant,
  getReferenceZone,
  getWallClockNote,
  LocationCommandType,
  ReferenceMode,
  WallClockNotePlacement,
  type WorldClockState,
} from "@/model";
import type { HourFormat } from "@/preferences";
import { type PresentedDateBar, presentDateBar } from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useHourFormat } from "./useHourFormat";

const MISSING_PROVIDER_MESSAGE =
  "useReferenceMoment must be used inside a LocationsProvider";

function buildDateBar(
  state: WorldClockState,
  clock: Clock,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
  translate: Parameters<typeof presentDateBar>[0]["translate"],
): PresentedDateBar {
  const now = clock.instant();
  const zone = getReferenceZone(state);
  const effective = getEffectiveInstant(state, now).toZonedDateTimeISO(zone);
  const note = getWallClockNote(state);
  const gap =
    note.placement === WallClockNotePlacement.DATE_BAR
      ? {
          requestedWallTime: note.requestedWallTime,
          shownWallTime: effective.toPlainTime(),
        }
      : undefined;
  return presentDateBar({
    effectiveDate: effective.toPlainDate(),
    today: now.toZonedDateTimeISO(zone).toPlainDate(),
    isPinned: state.reference.mode === ReferenceMode.PINNED,
    gap,
    language,
    hourFormat,
    translate,
  });
}

/**
 * The date bar texts and the date actions: previous and next day, a picked
 * date and the return to now. Actions dispatch straight to the store, never
 * through the write scheduler, so no date change is stored.
 * Implements FR1, FR2, FR3, FR4, FR6, FR7, NFR-A3 of
 * select-date-with-calendar-and-now (D5).
 * Implements FR7 of add-wall-time-input-with-hint (D2): the gap note comes
 * from `getWallClockNote`.
 * Implements FR5 of add-interface-language-selection (D3): dates and weekdays follow the active interface language.
 */
export function useReferenceMoment() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, minuteTick } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { t } = useTranslation();
  const { code: language } = useActiveInterfaceLanguage();
  const hourFormat = useHourFormat();
  const [announcement, setAnnouncement] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick moves a live bar past local midnight
  const dateBar = useMemo(
    () => buildDateBar(state, clock, language, hourFormat, t),
    [state, clock, language, hourFormat, t, minuteTick],
  );

  const actions = useMemo(() => {
    const nowTimestamp = () => clock.instant().toString();
    const dispatchAndAnnounce = (
      command: Parameters<typeof store.dispatch>[0],
    ) => {
      const stateBefore = store.getSnapshot();
      const outcome = store.dispatch(command);
      if (outcome.ok && store.getSnapshot() !== stateBefore) {
        setAnnouncement(
          buildDateBar(store.getSnapshot(), clock, language, hourFormat, t)
            .fullDateLabel,
        );
      }
    };
    return {
      showPreviousDay: () =>
        dispatchAndAnnounce({
          type: LocationCommandType.SHIFT_DATE,
          days: -ONE_DAY,
          now: nowTimestamp(),
        }),
      showNextDay: () =>
        dispatchAndAnnounce({
          type: LocationCommandType.SHIFT_DATE,
          days: ONE_DAY,
          now: nowTimestamp(),
        }),
      selectDate: (isoDate: string) =>
        dispatchAndAnnounce({
          type: LocationCommandType.SET_DATE,
          date: isoDate,
          now: nowTimestamp(),
        }),
      returnToNow: () =>
        dispatchAndAnnounce({ type: LocationCommandType.RESET_TO_NOW }),
    };
  }, [store, clock, language, hourFormat, t]);

  return { dateBar, announcement, ...actions };
}
