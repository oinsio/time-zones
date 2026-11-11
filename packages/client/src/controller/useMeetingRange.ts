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
  LocationErrorCode,
  type MeetingHandle,
  type MeetingRange,
  type MeetingSpan,
  type TrackMove,
  WallTimeTargetKind,
} from "@/model";
import {
  getDayPeriodMarkers,
  type PresentedLocationMeetingRange,
  type PresentedMeetingBar,
  type PresentedMeetingHandles,
  parseWallTimeInput,
  presentLocationMeetingRange,
  presentMeetingBar,
  presentMeetingHandles,
} from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useHourFormat } from "./useHourFormat";

const MISSING_PROVIDER_MESSAGE =
  "useMeetingRange must be used inside a LocationsProvider";

/** What the view does with the meeting range input after a confirmation. */
export enum MeetingRangeInputOutcome {
  /** The start text is not a time: the input stays open with its error. */
  INVALID_START_TEXT = "INVALID_START_TEXT",
  /** The end text is not a time: the input stays open with its error. */
  INVALID_END_TEXT = "INVALID_END_TEXT",
  /** The start and the end are the same time: the input stays open. */
  SAME_START_AND_END = "SAME_START_AND_END",
  /** The end is earlier than the start: the input stays open. */
  END_BEFORE_START = "END_BEFORE_START",
  /** The range does not lie inside the reference day: the input stays open. */
  OUTSIDE_REFERENCE_DAY = "OUTSIDE_REFERENCE_DAY",
  /** The store answered, with a change or another refusal: the input closes. */
  CLOSED = "CLOSED",
}

/** The refusal of the model that keeps the meeting range input open, by outcome. */
const OUTCOME_OF_REFUSAL: Partial<
  Record<LocationErrorCode, MeetingRangeInputOutcome>
> = {
  [LocationErrorCode.MEETING_START_EQUALS_END]:
    MeetingRangeInputOutcome.SAME_START_AND_END,
  [LocationErrorCode.MEETING_END_BEFORE_START]:
    MeetingRangeInputOutcome.END_BEFORE_START,
  [LocationErrorCode.INVALID_MEETING_RANGE]:
    MeetingRangeInputOutcome.OUTSIDE_REFERENCE_DAY,
};

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
 * Implements FR4 of fix-grid-meeting-range-lock-and-layering (D3): `confirmMeetingRangeInput`.
 * Implements FR2, FR3 of refine-meeting-range-entry-and-handles (D3): the refusal outcomes.
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
      confirmMeetingRangeInput: (
        locationId: string,
        startText: string,
        endText: string,
        date: string,
      ): MeetingRangeInputOutcome => {
        const markers = getDayPeriodMarkers(language);
        const start = parseWallTimeInput(startText, markers);
        if (start === undefined) {
          return MeetingRangeInputOutcome.INVALID_START_TEXT;
        }
        const end = parseWallTimeInput(endText, markers);
        if (end === undefined) return MeetingRangeInputOutcome.INVALID_END_TEXT;
        const outcome = store.dispatch({
          type: LocationCommandType.SET_MEETING_RANGE_WALL_TIMES,
          target: { kind: WallTimeTargetKind.LOCATION, locationId },
          date,
          start,
          end,
        });
        return (
          (!outcome.ok ? OUTCOME_OF_REFUSAL[outcome.error] : undefined) ??
          MeetingRangeInputOutcome.CLOSED
        );
      },
      clearMeetingRange: () => {
        store.dispatch({ type: LocationCommandType.CLEAR_MEETING_RANGE });
      },
    };
  }, [store, clock, setRange, language]);

  return { meeting, ...actions };
}
