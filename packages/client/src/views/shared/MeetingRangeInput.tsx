import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { KeyboardKey, MEETING_SPAN_SEPARATOR } from "@/constants";
import { MeetingRangeInputOutcome } from "@/controller";
import { getTypedTimeFieldText } from "./typedTimeFieldText";
import { isKeyKeptInField } from "./wallTimeFieldKeys";

type MeetingRangeInputProps = {
  city: string;
  initialStartText: string;
  initialEndText: string;
  onConfirm: (startText: string, endText: string) => MeetingRangeInputOutcome;
  /** `shouldRestoreFocus` is false when the user already moved the focus away. */
  onClose: (shouldRestoreFocus: boolean) => void;
};

/** The message key of each refusal that marks both fields. */
const RANGE_ERROR_KEYS: Partial<Record<MeetingRangeInputOutcome, string>> = {
  [MeetingRangeInputOutcome.SAME_START_AND_END]:
    "meeting.rangeInputSameTimesError",
  [MeetingRangeInputOutcome.END_BEFORE_START]:
    "meeting.rangeInputEndBeforeStartError",
  [MeetingRangeInputOutcome.OUTSIDE_REFERENCE_DAY]:
    "meeting.rangeInputOutsideDayError",
};

const FIELD_CLASS_NAMES =
  "min-h-11 w-20 rounded-md border border-accent bg-surface text-xl font-bold leading-none tabular-nums text-meeting-text md:w-28 md:text-[26px]";

/**
 * The two fields that replace a row's meeting span while the meeting range is
 * typed in the row's local time: start and end, text fields with a numeric
 * keyboard. The view keeps only the typed texts and the error; the controller
 * parses and the model resolves (ADR-0002).
 * Implements FR3, FR4, NFR-A1, NFR-A2, NFR-R1, UX2 of fix-grid-meeting-range-lock-and-layering (D4).
 * Implements FR3, UX3 of refine-meeting-range-entry-and-handles (D3): one message per refusal.
 */
export function MeetingRangeInput({
  city,
  initialStartText,
  initialEndText,
  onConfirm,
  onClose,
}: MeetingRangeInputProps) {
  const { t } = useTranslation();
  const errorId = useId();
  const startFieldRef = useRef<HTMLInputElement | null>(null);
  const [startText, setStartText] = useState(initialStartText);
  const [endText, setEndText] = useState(initialEndText);
  const [error, setError] = useState<MeetingRangeInputOutcome | undefined>();

  useEffect(() => {
    startFieldRef.current?.focus();
    startFieldRef.current?.select();
  }, []);

  const confirm = (shouldRestoreFocus: boolean) => {
    const outcome = onConfirm(startText, endText);
    if (outcome === MeetingRangeInputOutcome.CLOSED) {
      onClose(shouldRestoreFocus);
    } else {
      setError(outcome);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isKeyKeptInField(event.key)) event.stopPropagation();
    if (event.key === KeyboardKey.ENTER) {
      event.preventDefault();
      confirm(true);
    } else if (event.key === KeyboardKey.ESCAPE) {
      onClose(true);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    const isUnchanged =
      startText === initialStartText && endText === initialEndText;
    if (isUnchanged) onClose(false);
    else confirm(false);
  };

  const rangeErrorKey =
    error === undefined ? undefined : RANGE_ERROR_KEYS[error];
  const isRangeRefused = rangeErrorKey !== undefined;
  const isStartInvalid =
    error === MeetingRangeInputOutcome.INVALID_START_TEXT || isRangeRefused;
  const isEndInvalid =
    error === MeetingRangeInputOutcome.INVALID_END_TEXT || isRangeRefused;
  const errorMessage = t(rangeErrorKey ?? "locations.wallTimeInputError");
  const fieldProps = (isInvalid: boolean) => ({
    type: "text" as const,
    inputMode: "numeric" as const,
    autoComplete: "off",
    "aria-invalid": isInvalid,
    "aria-describedby": isInvalid ? errorId : undefined,
    onKeyDown: handleKeyDown,
    className: FIELD_CLASS_NAMES,
  });
  return (
    <span className="flex flex-col items-end md:items-start">
      <span
        className="flex items-center gap-x-1 text-meeting-text"
        onBlur={handleBlur}
      >
        <input
          ref={startFieldRef}
          aria-label={t("meeting.rangeInputStartLabel", { city })}
          value={startText}
          onChange={(event) =>
            setStartText(getTypedTimeFieldText(event, startText))
          }
          {...fieldProps(isStartInvalid)}
        />
        <span aria-hidden="true" className="font-bold">
          {MEETING_SPAN_SEPARATOR}
        </span>
        <input
          aria-label={t("meeting.rangeInputEndLabel", { city })}
          value={endText}
          onChange={(event) =>
            setEndText(getTypedTimeFieldText(event, endText))
          }
          {...fieldProps(isEndInvalid)}
        />
      </span>
      {error !== undefined && (
        <span id={errorId} className="text-sm text-danger">
          {errorMessage}
        </span>
      )}
    </span>
  );
}
