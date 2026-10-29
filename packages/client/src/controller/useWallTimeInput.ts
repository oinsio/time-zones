import { useContext, useMemo } from "react";
import { LocationCommandType, type WallTimeTarget } from "@/model";
import { parseWallTimeInput } from "@/presenter";
import { LocationsContext } from "./locationsContext";

export { type WallTimeTarget, WallTimeTargetKind } from "@/model";

const MISSING_PROVIDER_MESSAGE =
  "useWallTimeInput must be used inside a LocationsProvider";

/** What the view does with its field after a confirmation. */
export enum WallTimeInputOutcome {
  /** The text was not a time: the field stays open with its error. */
  INVALID_TEXT = "INVALID_TEXT",
  /** The store answered, with a change or a rejection: the field closes. */
  CLOSED = "CLOSED",
}

/**
 * The wall-time input action of a row: parses the typed text and dispatches
 * `SET_WALL_TIME` straight to the store, never through the write scheduler,
 * so no wall-time input is stored or shared with other tabs.
 * Implements FR3, FR6, FR8, FR9, FR10 of add-wall-time-input-with-hint (D5).
 */
export function useWallTimeInput() {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store } = context;
  return useMemo(
    () => ({
      confirmWallTime: (
        target: WallTimeTarget,
        text: string,
        date: string,
      ): WallTimeInputOutcome => {
        const time = parseWallTimeInput(text);
        if (time === undefined) return WallTimeInputOutcome.INVALID_TEXT;
        store.dispatch({
          type: LocationCommandType.SET_WALL_TIME,
          target,
          time,
          date,
        });
        return WallTimeInputOutcome.CLOSED;
      },
    }),
    [store],
  );
}
