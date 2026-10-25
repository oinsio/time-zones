import { useContext, useMemo, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { ONE_DAY } from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import type { Clock } from "@/lib/temporal";
import {
  getEffectiveInstant,
  getReferenceZone,
  LocationCommandType,
  type LocationsState,
  ReferenceMode,
  WallClockStatus,
} from "@/model";
import { type PresentedDateBar, presentDateBar } from "@/presenter";
import { LocationsContext } from "./locationsContext";

const MISSING_PROVIDER_MESSAGE =
  "useReferenceMoment must be used inside a LocationsProvider";

function buildDateBar(
  state: LocationsState,
  clock: Clock,
  language: SupportedLanguage,
  translate: Parameters<typeof presentDateBar>[0]["translate"],
): PresentedDateBar {
  const now = clock.instant();
  const zone = getReferenceZone(state);
  const effective = getEffectiveInstant(state, now).toZonedDateTimeISO(zone);
  const { reference } = state;
  const hasGap =
    reference.mode === ReferenceMode.PINNED &&
    reference.wallClockStatus === WallClockStatus.GAP;
  return presentDateBar({
    effectiveDate: effective.toPlainDate(),
    today: now.toZonedDateTimeISO(zone).toPlainDate(),
    isPinned: reference.mode === ReferenceMode.PINNED,
    gap: hasGap
      ? {
          requestedWallTime: reference.requestedWallTime,
          shownWallTime: effective.toPlainTime(),
        }
      : undefined,
    language,
    translate,
  });
}

/**
 * The date bar texts and the date actions: previous and next day, a picked
 * date and the return to now. Actions dispatch straight to the store, never
 * through the write scheduler, so no date change is stored.
 * Implements FR1, FR2, FR3, FR4, FR6, FR7, NFR-A3 of
 * select-date-with-calendar-and-now (D5).
 */
export function useReferenceMoment() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, minuteTick } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { i18n, t } = useTranslation();
  const language = (i18n.resolvedLanguage ??
    i18n.language) as SupportedLanguage;
  const [announcement, setAnnouncement] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick moves a live bar past local midnight
  const dateBar = useMemo(
    () => buildDateBar(state, clock, language, t),
    [state, clock, language, t, minuteTick],
  );

  const actions = useMemo(() => {
    const dispatchAndAnnounce = (
      command:
        | { type: LocationCommandType.SET_DATE; date: string }
        | { type: LocationCommandType.SHIFT_DATE; days: number }
        | { type: LocationCommandType.RESET_TO_NOW },
    ) => {
      const stateBefore = store.getSnapshot();
      const now = clock.instant().toString();
      const outcome = store.dispatch(
        command.type === LocationCommandType.RESET_TO_NOW
          ? command
          : { ...command, now },
      );
      if (outcome.ok && store.getSnapshot() !== stateBefore) {
        setAnnouncement(
          buildDateBar(store.getSnapshot(), clock, language, t).fullDateLabel,
        );
      }
    };
    return {
      showPreviousDay: () =>
        dispatchAndAnnounce({
          type: LocationCommandType.SHIFT_DATE,
          days: -ONE_DAY,
        }),
      showNextDay: () =>
        dispatchAndAnnounce({
          type: LocationCommandType.SHIFT_DATE,
          days: ONE_DAY,
        }),
      selectDate: (isoDate: string) =>
        dispatchAndAnnounce({
          type: LocationCommandType.SET_DATE,
          date: isoDate,
        }),
      returnToNow: () =>
        dispatchAndAnnounce({ type: LocationCommandType.RESET_TO_NOW }),
    };
  }, [store, clock, language, t]);

  return { dateBar, announcement, ...actions };
}
