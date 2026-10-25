import { useContext, useMemo } from "react";
import {
  getEffectiveInstant,
  getInstantAfterTrackMove,
  getInstantAtTrackFraction,
  getReferenceDay,
  LocationCommandType,
  type TrackMove,
} from "@/model";
import { LocationsContext } from "./locationsContext";

const MISSING_PROVIDER_MESSAGE =
  "useTimeSelection must be used inside a LocationsProvider";

/**
 * The time selection actions of the day tracks: pick a position and move by
 * a key step. Actions dispatch straight to the store, never through the
 * write scheduler, so no time selection is stored.
 * Implements FR3, FR4, FR5, FR8 of add-time-sliders-to-location-cards (D6).
 */
export function useTimeSelection() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock } = context;
  return useMemo(() => {
    const getReferenceContext = () => {
      const state = store.getSnapshot();
      const now = clock.instant();
      return {
        day: getReferenceDay(state, now),
        effectiveInstant: getEffectiveInstant(state, now),
      };
    };
    const selectInstant = (instant: string) =>
      store.dispatch({ type: LocationCommandType.SELECT_INSTANT, instant });
    return {
      selectTrackFraction: (fraction: number) => {
        const { day } = getReferenceContext();
        selectInstant(getInstantAtTrackFraction(day, fraction).toString());
      },
      moveTrack: (move: TrackMove) => {
        const { day, effectiveInstant } = getReferenceContext();
        selectInstant(
          getInstantAfterTrackMove(day, effectiveInstant, move).toString(),
        );
      },
    };
  }, [store, clock]);
}
