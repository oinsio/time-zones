import { type Dispatch, useMemo } from "react";
import type { Clock } from "@/lib/temporal";
import {
  type ConverterCommand,
  ConverterCommandType,
  type ConverterState,
  getMinuteStart,
  toInstant,
  type UnixTimeUnitChoice,
} from "@/model/unixTime";
import type { CopyOutcome, TextCopying } from "@/ports";
import { getDayPeriodMarkers } from "@/presenter";
import {
  type ConverterNotationId,
  type PresentedConverter,
  parseExactWallTimeInput,
} from "@/presenter/unixTime";
import { useActiveInterfaceLanguage } from "../useActiveInterfaceLanguage";
import { useTimeSelection } from "../useTimeSelection";
import { WallTimeInputOutcome } from "../useWallTimeInput";

/** The commands a converter view sends; each is one user intention. */
export type ConverterCommands = {
  typeInput: (text: string) => void;
  chooseUnit: (unitChoice: UnixTimeUnitChoice) => void;
  /** Confirms a typed row time; an unreadable text leaves the moment and asks the view to keep its field open. */
  setRowWallTime: (rowId: string, text: string) => WallTimeInputOutcome;
  setRowDate: (rowId: string, isoDate: string) => void;
  returnToNow: () => void;
  copyNotation: (notationId: ConverterNotationId) => Promise<CopyOutcome>;
  showOnMainPage: () => void;
};

type ConverterCommandsInput = {
  state: ConverterState;
  presented: PresentedConverter;
  dispatch: Dispatch<ConverterCommand>;
  clock: Clock;
  textCopying: TextCopying;
  onLeave: () => void;
};

/**
 * The commands of the converter page: they turn what a view sends into model
 * commands, copy through `TextCopying` and hand the moment to the main page.
 * Implements FR10, FR11, FR12, FR14, FR16 of add-unix-time-converter-tool (D6, D8, D10).
 */
export function useConverterCommands({
  state,
  presented,
  dispatch,
  clock,
  textCopying,
  onLeave,
}: ConverterCommandsInput): ConverterCommands {
  const { selectInstant } = useTimeSelection();
  const { code: language } = useActiveInterfaceLanguage();
  return useMemo(() => {
    const findRow = (rowId: string) =>
      presented.rows.find((row) => row.id === rowId);
    return {
      typeInput: (text) =>
        dispatch({ type: ConverterCommandType.TYPE_INPUT, text }),
      chooseUnit: (unitChoice) =>
        dispatch({ type: ConverterCommandType.CHOOSE_UNIT, unitChoice }),
      setRowWallTime: (rowId, text) => {
        const row = findRow(rowId);
        const wallTime = parseExactWallTimeInput(
          text,
          getDayPeriodMarkers(language),
        );
        if (row === undefined || wallTime === undefined) {
          return WallTimeInputOutcome.INVALID_TEXT;
        }
        dispatch({
          type: ConverterCommandType.SET_ROW_WALL_TIME,
          locationId: row.id,
          timeZoneId: row.timeZoneId,
          wallTime,
        });
        return WallTimeInputOutcome.CLOSED;
      },
      setRowDate: (rowId, isoDate) => {
        const row = findRow(rowId);
        if (row === undefined) return;
        dispatch({
          type: ConverterCommandType.SET_ROW_DATE,
          locationId: row.id,
          timeZoneId: row.timeZoneId,
          isoDate,
        });
      },
      returnToNow: () =>
        dispatch({
          type: ConverterCommandType.RETURN_TO_NOW,
          nowEpochMilliseconds: clock.instant().epochMilliseconds,
        }),
      copyNotation: (notationId) => {
        const notation = presented.notations.find(
          ({ id }) => id === notationId,
        );
        return textCopying.copyText(notation?.text ?? "");
      },
      showOnMainPage: () => {
        selectInstant(getMinuteStart(toInstant(state.moment)));
        onLeave();
      },
    };
  }, [
    state,
    presented,
    dispatch,
    clock,
    textCopying,
    onLeave,
    selectInstant,
    language,
  ]);
}
