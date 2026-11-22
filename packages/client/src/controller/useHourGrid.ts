import { useContext, useMemo, useSyncExternalStore } from "react";
import {
  getEffectiveInstant,
  getHourCellCount,
  getHourFrameIndex,
  getReferenceDay,
  getReferenceZone,
  getStripTailCellCount,
  getSunCoordinates,
} from "@/model";
import {
  getHourFrameColour,
  type PresentedHourStrip,
  presentHourStrip,
} from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useDayColouring } from "./useDayColouring";
import { useHourFormat } from "./useHourFormat";

const MISSING_PROVIDER_MESSAGE =
  "useHourGrid must be used inside a LocationsProvider";

/**
 * The hour strips of every location over the reference day and the column of
 * the hour frame. Re-presented at every minute tick and on every change of
 * the reference moment; a strip is the same object while the day, language
 * and hour format stay.
 * Implements FR8, FR9, NFR-P1 of add-grid-hour-cells-and-hour-frame (D3).
 * Implements FR7 of add-grid-meeting-range-and-share (D5): `hasMeetingRange` ends the hour frame.
 * Implements FR12, FR13 of add-day-colouring-setting (D4): the day colouring and the hour frame colour.
 * Implements FR6, FR9, NFR-P1 of move-meeting-range-and-extend-past-midnight (D4, D10): the strip tail
 * counts in `cellCount`; `frozenTailCellCount` keeps the tail of a drag's press until the drag ends.
 */
export function useHourGrid(frozenTailCellCount?: number) {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, minuteTick } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const hourFormat = useHourFormat();
  const { dayColouring, workingHours } = useDayColouring();
  const { code: language } = useActiveInterfaceLanguage();
  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick moves the live frame at each minute
  return useMemo(() => {
    const now = clock.instant();
    const day = getReferenceDay(state, now);
    const referenceZoneId = getReferenceZone(state);
    const tailCellCount =
      frozenTailCellCount ??
      getStripTailCellCount(state.meeting, day, referenceZoneId);
    const strips = new Map<string, PresentedHourStrip>();
    for (const location of state.locations) {
      try {
        strips.set(
          location.id,
          presentHourStrip(location.timeZoneId, {
            day,
            coordinates: getSunCoordinates(location),
            referenceZoneId,
            language,
            hourFormat,
            dayColouring,
            workingHours,
            tailCellCount,
          }),
        );
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
    }
    return {
      strips,
      hourFrameIndex: getHourFrameIndex(day, getEffectiveInstant(state, now)),
      cellCount: getHourCellCount(day) + tailCellCount,
      tailCellCount,
      hasMeetingRange: state.meeting !== undefined,
      hourFrameColour: getHourFrameColour(dayColouring),
    };
  }, [
    state,
    frozenTailCellCount,
    language,
    hourFormat,
    dayColouring,
    workingHours,
    clock,
    minuteTick,
  ]);
}
