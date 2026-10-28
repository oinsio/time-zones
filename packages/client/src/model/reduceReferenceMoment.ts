import { Temporal } from "@/lib/temporal";
import {
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import {
  getEffectiveInstant,
  getReferenceZone,
  LIVE_REFERENCE_MOMENT,
  ReferenceMode,
} from "./referenceMoment";
import { resolveWallClock } from "./wallClock";

type DateCommand = Extract<
  LocationCommand,
  {
    type:
      | LocationCommandType.SET_DATE
      | LocationCommandType.SHIFT_DATE
      | LocationCommandType.RESET_TO_NOW;
  }
>;

const fail = (error: LocationErrorCode): LocationsReduceResult => ({
  ok: false,
  error,
});

type DatePicker = (current: Temporal.PlainDate) => Temporal.PlainDate;

/** Pins the moment to `date` at the wall time the moment has now. */
function moveToDate(
  state: WorldClockState,
  now: Temporal.Instant,
  pickDate: DatePicker,
): LocationsReduceResult {
  const zone = getReferenceZone(state);
  try {
    const current = getEffectiveInstant(state, now).toZonedDateTimeISO(zone);
    const date = pickDate(current.toPlainDate());
    if (date.equals(current.toPlainDate())) return { ok: true, state };
    const requestedWallTime = current.toPlainTime();
    const { instant, status } = resolveWallClock(
      zone,
      date.toPlainDateTime(requestedWallTime),
    );
    return {
      ok: true,
      state: {
        ...state,
        reference: {
          mode: ReferenceMode.PINNED,
          instant,
          wallClockStatus: status,
          requestedWallTime,
        },
      },
    };
  } catch (e) {
    if (e instanceof RangeError)
      return fail(LocationErrorCode.DATE_OUT_OF_RANGE);
    throw e;
  }
}

/** @throws RangeError for a malformed ISO date. */
function buildDatePicker(
  command: Exclude<DateCommand, { type: LocationCommandType.RESET_TO_NOW }>,
): DatePicker {
  if (command.type === LocationCommandType.SHIFT_DATE) {
    return (current) => current.add({ days: command.days });
  }
  const requestedDate = Temporal.PlainDate.from(command.date);
  return () => requestedDate;
}

/**
 * Reduces the date commands of the locations state: the previous and next
 * day, a picked date and the return to now. The commands carry ISO strings
 * only, so they replay deterministically (ADR-0002).
 * Implements FR1, FR2, FR3, FR4, FR6, FR10 of select-date-with-calendar-and-now (D1).
 */
export function reduceReferenceMoment(
  state: WorldClockState,
  command: DateCommand,
): LocationsReduceResult {
  if (command.type === LocationCommandType.RESET_TO_NOW) {
    if (state.reference.mode === ReferenceMode.LIVE) return { ok: true, state };
    return { ok: true, state: { ...state, reference: LIVE_REFERENCE_MOMENT } };
  }
  try {
    const now = Temporal.Instant.from(command.now);
    return moveToDate(state, now, buildDatePicker(command));
  } catch (e) {
    if (e instanceof RangeError) return fail(LocationErrorCode.INVALID_DATE);
    throw e;
  }
}
