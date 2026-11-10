import { useContext, useMemo, useSyncExternalStore } from "react";
import {
  getEffectiveInstant,
  getHourCellCount,
  getHourFrameIndex,
  getReferenceDay,
  getReferenceZone,
} from "@/model";
import { type PresentedHourStrip, presentHourStrip } from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
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
 */
export function useHourGrid() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock, minuteTick } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const hourFormat = useHourFormat();
  const { code: language } = useActiveInterfaceLanguage();
  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick moves the live frame at each minute
  return useMemo(() => {
    const now = clock.instant();
    const day = getReferenceDay(state, now);
    const referenceZoneId = getReferenceZone(state);
    const strips = new Map<string, PresentedHourStrip>();
    for (const location of state.locations) {
      try {
        strips.set(
          location.id,
          presentHourStrip(location.timeZoneId, {
            day,
            referenceZoneId,
            language,
            hourFormat,
          }),
        );
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
    }
    return {
      strips,
      hourFrameIndex: getHourFrameIndex(day, getEffectiveInstant(state, now)),
      cellCount: getHourCellCount(day),
      hasMeetingRange: state.meeting !== undefined,
    };
  }, [state, language, hourFormat, clock, minuteTick]);
}
