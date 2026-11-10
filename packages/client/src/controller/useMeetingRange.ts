import { useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
  getEffectiveInstant,
  getHourFrameIndex,
  getMeetingRangeAfterHandleMove,
  getMeetingRangeAtHandleMinutes,
  getMeetingRangeOfCells,
  getMeetingSpan,
  getReferenceDay,
  getReferenceZone,
  LocationCommandType,
  type MeetingHandle,
  type MeetingRange,
  type MeetingSpan,
  type TrackMove,
} from "@/model";
import {
  type PresentedLocationMeetingRange,
  type PresentedMeetingBar,
  type PresentedMeetingHandles,
  presentLocationMeetingRange,
  presentMeetingBar,
  presentMeetingHandles,
} from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useHourFormat } from "./useHourFormat";

const MISSING_PROVIDER_MESSAGE =
  "useMeetingRange must be used inside a LocationsProvider";

export type PresentedMeeting = {
  range: MeetingRange;
  span: MeetingSpan;
  durationMinutes: number;
  handles: PresentedMeetingHandles;
  bar: PresentedMeetingBar;
  /** The local span of every location by id; a location with an unknown zone is absent. */
  rowRanges: ReadonlyMap<string, PresentedLocationMeetingRange>;
};

/**
 * The presented meeting range of the Grid view and its actions: select cells
 * or the framed hour, move or drag a handle, clear. Actions dispatch straight
 * to the store, never through the write scheduler, so the range is never stored.
 * Implements FR2, FR5, FR6, FR10, FR12, FR13 of add-grid-meeting-range-and-share (D5).
 */
export function useMeetingRange() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { t } = useTranslation();
  const { code: language } = useActiveInterfaceLanguage();
  const hourFormat = useHourFormat();

  const meeting = useMemo((): PresentedMeeting | undefined => {
    const range = state.meeting;
    if (range === undefined) return undefined;
    const day = getReferenceDay(state, clock.instant());
    const referenceZoneId = getReferenceZone(state);
    const presentation = { language, hourFormat, translate: t };
    const span = getMeetingSpan(day, range);
    const durationMinutes = span.endMinutes - span.startMinutes;
    const rowRanges = new Map<string, PresentedLocationMeetingRange>();
    for (const location of state.locations) {
      try {
        rowRanges.set(
          location.id,
          presentLocationMeetingRange(
            location.timeZoneId,
            range,
            referenceZoneId,
            presentation,
          ),
        );
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
    }
    return {
      range,
      span,
      durationMinutes,
      handles: presentMeetingHandles(day, range, referenceZoneId, presentation),
      bar: presentMeetingBar(durationMinutes, t),
      rowRanges,
    };
  }, [state, language, hourFormat, t, clock]);

  const setRange = useCallback(
    (range: MeetingRange) =>
      store.dispatch({
        type: LocationCommandType.SET_MEETING_RANGE,
        start: range.start.toString(),
        end: range.end.toString(),
      }),
    [store],
  );

  const actions = useMemo(() => {
    const getDay = () => getReferenceDay(store.getSnapshot(), clock.instant());
    const selectCells = (firstColumn: number, lastColumn: number) => {
      setRange(getMeetingRangeOfCells(getDay(), firstColumn, lastColumn));
    };
    return {
      selectCells,
      selectFramedHour: () => {
        const column = getHourFrameIndex(
          getDay(),
          getEffectiveInstant(store.getSnapshot(), clock.instant()),
        );
        selectCells(column, column);
      },
      moveHandle: (handle: MeetingHandle, move: TrackMove) => {
        const current = store.getSnapshot().meeting;
        if (current === undefined) return;
        setRange(
          getMeetingRangeAfterHandleMove(getDay(), current, handle, move),
        );
      },
      dragHandleTo: (handle: MeetingHandle, minutes: number) => {
        const current = store.getSnapshot().meeting;
        if (current === undefined) return;
        const next = getMeetingRangeAtHandleMinutes(
          getDay(),
          current,
          handle,
          minutes,
        );
        if (next.start.equals(current.start) && next.end.equals(current.end)) {
          return;
        }
        setRange(next);
      },
      clearMeetingRange: () => {
        store.dispatch({ type: LocationCommandType.CLEAR_MEETING_RANGE });
      },
    };
  }, [store, clock, setRange]);

  return { meeting, ...actions };
}
