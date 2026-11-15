import { type FocusEvent, type KeyboardEvent, useId, useState } from "react";
import {
  KeyboardKey,
  MEETING_SPAN_SEPARATOR,
  SETTINGS_GROUP_CAPTION_CLASS_NAME,
  SETTINGS_GROUP_ROW_CLASS_NAME,
} from "@/constants";
import { cn } from "@/shared/lib/cn";
import { getTypedTimeFieldText, isKeyKeptInField } from "@/views/shared";

export type TimeRangeInvalidFields = { start: boolean; end: boolean };

type SettingsTimeRangeGroupProps = {
  caption: string;
  startLabel: string;
  endLabel: string;
  /** The texts the fields show; a change of these texts resets what the user typed. */
  startText: string;
  endText: string;
  /** Shown under the fields in a polite live region and read as their description. */
  hint?: string;
  invalidFields?: TimeRangeInvalidFields;
  /** Enter, or leaving the row with changed texts: the pair the user confirms. Returns whether it was accepted; the fields then show the given texts again. */
  onConfirm: (startText: string, endText: string) => boolean;
  /** Esc with edited texts or a shown hint: the group shows the given texts again. */
  onRestore: () => void;
};

const NO_INVALID_FIELDS: TimeRangeInvalidFields = { start: false, end: false };

const FIELD_CLASS_NAME =
  "min-h-11 w-24 rounded-md border bg-surface px-2 text-center text-sm font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * A compact settings group in one row: a caption and two text fields joined by
 * a dash, for a range of times. It only types: it inserts the separator while
 * digits are typed and reports the confirmed pair of texts; it never reads or
 * interprets a time. Reusable by any setting that holds a time range.
 * Implements FR14, UX2, NFR-A2 of add-day-colouring-setting (D8).
 */
export function SettingsTimeRangeGroup({
  caption,
  startLabel,
  endLabel,
  startText,
  endText,
  hint,
  invalidFields = NO_INVALID_FIELDS,
  onConfirm,
  onRestore,
}: SettingsTimeRangeGroupProps) {
  const captionId = useId();
  const hintId = useId();
  const [typedStart, setTypedStart] = useState(startText);
  const [typedEnd, setTypedEnd] = useState(endText);
  const [shownTexts, setShownTexts] = useState({ startText, endText });
  if (shownTexts.startText !== startText || shownTexts.endText !== endText) {
    setShownTexts({ startText, endText });
    setTypedStart(startText);
    setTypedEnd(endText);
  }
  const hasHint = hint !== undefined && hint !== "";
  const isEdited = typedStart !== startText || typedEnd !== endText;

  const confirm = () => {
    if (onConfirm(typedStart, typedEnd)) {
      setTypedStart(startText);
      setTypedEnd(endText);
    }
  };

  const restore = () => {
    setTypedStart(startText);
    setTypedEnd(endText);
    onRestore();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isEscapeToHold =
      event.key === KeyboardKey.ESCAPE && (isEdited || hasHint);
    const isEscapeToLeave = event.key === KeyboardKey.ESCAPE && !isEscapeToHold;
    if (isKeyKeptInField(event.key) && !isEscapeToLeave) {
      event.stopPropagation();
    }
    if (event.key === KeyboardKey.ENTER) {
      event.preventDefault();
      confirm();
    } else if (isEscapeToHold) {
      restore();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (isEdited) confirm();
  };

  const fieldProps = (isInvalid: boolean) => ({
    type: "text" as const,
    inputMode: "numeric" as const,
    autoComplete: "off",
    "aria-invalid": isInvalid,
    "aria-describedby": isInvalid && hasHint ? hintId : undefined,
    onKeyDown: handleKeyDown,
    className: cn(
      FIELD_CLASS_NAME,
      isInvalid ? "border-danger" : "border-border",
    ),
  });

  return (
    <div role="group" aria-labelledby={captionId} className="flex flex-col">
      <div className={SETTINGS_GROUP_ROW_CLASS_NAME}>
        <span id={captionId} className={SETTINGS_GROUP_CAPTION_CLASS_NAME}>
          {caption}
        </span>
        <div className="flex items-center gap-1" onBlur={handleBlur}>
          <input
            aria-label={startLabel}
            value={typedStart}
            onChange={(event) =>
              setTypedStart(getTypedTimeFieldText(event, typedStart))
            }
            {...fieldProps(invalidFields.start)}
          />
          <span aria-hidden="true" className="font-semibold">
            {MEETING_SPAN_SEPARATOR}
          </span>
          <input
            aria-label={endLabel}
            value={typedEnd}
            onChange={(event) =>
              setTypedEnd(getTypedTimeFieldText(event, typedEnd))
            }
            {...fieldProps(invalidFields.end)}
          />
        </div>
      </div>
      <span
        id={hintId}
        role="status"
        aria-live="polite"
        className={hasHint ? "mt-2 text-end text-sm text-danger" : undefined}
      >
        {hasHint ? hint : null}
      </span>
    </div>
  );
}
