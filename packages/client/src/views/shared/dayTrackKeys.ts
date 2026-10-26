import { KeyboardKey } from "@/constants";
import { TrackMove } from "@/controller";

const MOVE_BY_KEY: ReadonlyMap<string, TrackMove> = new Map([
  [KeyboardKey.ARROW_RIGHT, TrackMove.NEXT_STEP],
  [KeyboardKey.ARROW_UP, TrackMove.NEXT_STEP],
  [KeyboardKey.ARROW_LEFT, TrackMove.PREVIOUS_STEP],
  [KeyboardKey.ARROW_DOWN, TrackMove.PREVIOUS_STEP],
  [KeyboardKey.PAGE_UP, TrackMove.HOUR_FORWARD],
  [KeyboardKey.PAGE_DOWN, TrackMove.HOUR_BACK],
  [KeyboardKey.HOME, TrackMove.DAY_START],
  [KeyboardKey.END, TrackMove.DAY_END],
]);

/**
 * The track move a slider key asks for; `undefined` for other keys.
 * Implements FR4 of add-time-sliders-to-location-cards (D7).
 */
export function getTrackMoveForKey(key: string): TrackMove | undefined {
  return MOVE_BY_KEY.get(key);
}
