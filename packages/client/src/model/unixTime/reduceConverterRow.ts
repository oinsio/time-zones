import {
  MAX_UNIX_TIME_FRACTION_DIGITS,
  MILLISECONDS_PER_SECOND,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { ReferenceMode, resolveWallClock } from "@/model";
import type { ConverterCommand } from "./converterCommands";
import { ConverterCommandType } from "./converterCommands";
import { type ConverterState, writeInputText } from "./converterState";
import {
  type ExactInstant,
  getPrecisionOfFractionDigits,
  isExactInstantInRange,
  toInstant,
} from "./exactInstant";
import type { UnixTimeUnit } from "./unixTimeUnit";

type RowCommand = Extract<
  ConverterCommand,
  | { type: ConverterCommandType.SET_ROW_WALL_TIME }
  | { type: ConverterCommandType.SET_ROW_DATE }
>;

type Resolved = {
  instant: ExactInstant;
  precision: UnixTimeUnit;
  rowNote: ConverterState["rowNote"];
};

/** The exact instant of a resolved wall-clock time plus the fraction the row carries. */
function toExactInstant(
  resolvedInstant: Temporal.Instant,
  nanoseconds: number,
): ExactInstant {
  return {
    unixSeconds: Math.floor(
      resolvedInstant.epochMilliseconds / MILLISECONDS_PER_SECOND,
    ),
    nanoseconds,
  };
}

/** The nanoseconds and the precision of the fraction digits typed in a row time. */
function readTypedFraction(fractionDigits: string) {
  return {
    nanoseconds: Number(
      fractionDigits.padEnd(MAX_UNIX_TIME_FRACTION_DIGITS, "0"),
    ),
    precision: getPrecisionOfFractionDigits(fractionDigits.length),
  };
}

function resolveRowCommand(
  state: ConverterState,
  command: RowCommand,
): Resolved {
  const { timeZoneId, locationId } = command;
  const local = toInstant(state.moment).toZonedDateTimeISO(timeZoneId);
  const isTime = command.type === ConverterCommandType.SET_ROW_WALL_TIME;
  const date = isTime
    ? local.toPlainDate()
    : Temporal.PlainDate.from(command.isoDate);
  const time = isTime
    ? Temporal.PlainTime.from({
        hour: command.wallTime.hour,
        minute: command.wallTime.minute,
        second: command.wallTime.second,
      })
    : local
        .toPlainTime()
        .with({ millisecond: 0, microsecond: 0, nanosecond: 0 });
  const { instant, status } = resolveWallClock(
    timeZoneId,
    date.toPlainDateTime(time),
  );
  const { nanoseconds, precision } =
    command.type === ConverterCommandType.SET_ROW_WALL_TIME
      ? readTypedFraction(command.wallTime.fractionDigits)
      : { nanoseconds: state.moment.nanoseconds, precision: state.precision };
  return {
    instant: toExactInstant(instant, nanoseconds),
    precision,
    rowNote: { locationId, status, requestedWallTime: time.toString() },
  };
}

/**
 * Pins the converter moment to a wall-clock time typed in a row, or to the
 * row's time on a chosen date, through the wall-clock owner: a time in a DST
 * gap or overlap is resolved as the main page resolves it. A value outside
 * the range leaves the state as it was.
 * Implements FR10, FR11 of add-unix-time-converter-tool (D6).
 */
export function reduceConverterRow(
  state: ConverterState,
  command: RowCommand,
): ConverterState {
  try {
    const { instant, precision, rowNote } = resolveRowCommand(state, command);
    if (!isExactInstantInRange(instant)) return state;
    return writeInputText({
      ...state,
      mode: ReferenceMode.PINNED,
      moment: instant,
      precision,
      rowNote,
    });
  } catch (error) {
    if (error instanceof RangeError) return state;
    throw error;
  }
}
