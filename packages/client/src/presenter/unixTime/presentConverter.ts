import type { Temporal } from "@/lib/temporal";
import type { Location } from "@/model";
import { ReferenceMode } from "@/model";
import {
  ConverterInputError,
  type ConverterState,
  formatExactIsoInstant,
  formatUnixTime,
  toInstant,
  UNIX_TIME_UNITS_BY_PRECISION,
  UnixTimeUnit,
  UnixTimeUnitChoice,
} from "@/model/unixTime";
import {
  type ConverterRowsContext,
  type PresentedConverterRow,
  presentConverterRows,
} from "./presentConverterRows";
import { presentRelativeTime } from "./presentRelativeTime";

const UNIT_LABEL_KEYS: Record<UnixTimeUnit, string> = {
  [UnixTimeUnit.SECONDS]: "unixTime.unitSeconds",
  [UnixTimeUnit.MILLISECONDS]: "unixTime.unitMilliseconds",
  [UnixTimeUnit.MICROSECONDS]: "unixTime.unitMicroseconds",
  [UnixTimeUnit.NANOSECONDS]: "unixTime.unitNanoseconds",
};

const UNIT_CHOICE_LABEL_KEYS: Record<UnixTimeUnitChoice, string> = {
  [UnixTimeUnitChoice.AUTO]: "unixTime.unitAuto",
  [UnixTimeUnitChoice.SECONDS]: UNIT_LABEL_KEYS[UnixTimeUnit.SECONDS],
  [UnixTimeUnitChoice.MILLISECONDS]: UNIT_LABEL_KEYS[UnixTimeUnit.MILLISECONDS],
  [UnixTimeUnitChoice.MICROSECONDS]: UNIT_LABEL_KEYS[UnixTimeUnit.MICROSECONDS],
  [UnixTimeUnitChoice.NANOSECONDS]: UNIT_LABEL_KEYS[UnixTimeUnit.NANOSECONDS],
};

const INPUT_ERROR_MESSAGE_KEYS: Record<ConverterInputError, string> = {
  [ConverterInputError.UNREADABLE]: "unixTime.messageUnreadable",
  [ConverterInputError.OUT_OF_RANGE]: "unixTime.messageOutOfRange",
};

const NOTATION_ISO_ID = "ISO_8601";

/** Which notation a copy action copies: a unit, or ISO 8601. */
export type ConverterNotationId = UnixTimeUnit | typeof NOTATION_ISO_ID;

export type PresentedUnitOption = {
  choice: UnixTimeUnitChoice;
  label: string;
  isSelected: boolean;
};

export type PresentedNotation = {
  id: ConverterNotationId;
  label: string;
  text: string;
  /** The name of the copy action. */
  copyLabel: string;
};

/**
 * What every converter view shows and nothing it decides: the input with its
 * name, hint and message, the unit options, the rows, the notations, the
 * relative time and the two actions with their active flags.
 * Implements FR9, FR12, FR13, FR15, FR17, FR18 of add-unix-time-converter-tool (D7).
 */
export type PresentedConverter = {
  input: {
    text: string;
    name: string;
    /** The first message text, shown as a hint when the input is empty. */
    hint: string;
    /** The message of the input error; `undefined` for none. */
    message?: string;
  };
  unitOptions: readonly PresentedUnitOption[];
  /** "Единица: Секунды": the unit in force, named beside the input. */
  unitInForceLabel: string;
  rows: readonly PresentedConverterRow[];
  notations: readonly PresentedNotation[];
  relativeTime: string;
  /** Now is active while the moment is pinned. */
  isNowActive: boolean;
  /** Show on main page is active while the moment is pinned. */
  isShowOnMainPageActive: boolean;
};

export type ConverterContext = ConverterRowsContext & {
  now: Temporal.Instant;
};

/**
 * Presents the converter state: the one owner of every text of the converter
 * page. Time math stays in the model; this file picks keys and formats.
 * Implements FR9, FR12, FR13, FR15, FR18, NFR-P2 of add-unix-time-converter-tool (D7).
 */
export function presentConverter(
  state: ConverterState,
  locations: readonly Location[],
  context: ConverterContext,
): PresentedConverter {
  const { translate } = context;
  const unitOptions = Object.values(UnixTimeUnitChoice).map((choice) => ({
    choice,
    label: translate(UNIT_CHOICE_LABEL_KEYS[choice]),
    isSelected: choice === state.unitChoice,
  }));
  const notations: PresentedNotation[] = [
    ...UNIX_TIME_UNITS_BY_PRECISION.map((unit) => ({
      id: unit,
      label: translate(UNIT_LABEL_KEYS[unit]),
      text: formatUnixTime(state.moment, unit),
    })),
    {
      id: NOTATION_ISO_ID as ConverterNotationId,
      label: translate("unixTime.notationIso"),
      text: formatExactIsoInstant(state.moment, state.precision),
    },
  ].map((notation) => ({
    ...notation,
    copyLabel: translate("unixTime.copyNotation", {
      notation: notation.label,
    }),
  }));
  const isPinned = state.mode === ReferenceMode.PINNED;
  return {
    input: {
      text: state.inputText,
      name: translate("unixTime.inputLabel"),
      hint: translate("unixTime.inputHint"),
      message:
        state.inputError === undefined
          ? undefined
          : translate(INPUT_ERROR_MESSAGE_KEYS[state.inputError]),
    },
    unitOptions,
    unitInForceLabel: translate("unixTime.unitInForce", {
      unit: translate(UNIT_LABEL_KEYS[state.unit]),
    }),
    rows: presentConverterRows(locations, state, context),
    notations,
    relativeTime: presentRelativeTime(
      toInstant(state.moment),
      context.now,
      translate,
    ),
    isNowActive: isPinned,
    isShowOnMainPageActive: isPinned,
  };
}
