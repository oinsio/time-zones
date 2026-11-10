import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardKey } from "@/constants";
import { WallTimeInputOutcome } from "@/controller";
import { isKeyKeptInField } from "./wallTimeFieldKeys";

type WallTimeInputProps = {
  /** Accessible name: "Enter time — city, time". */
  label: string;
  initialText: string;
  onConfirm: (text: string) => WallTimeInputOutcome;
  /** `shouldRestoreFocus` is false when the user already moved the focus away. */
  onClose: (shouldRestoreFocus: boolean) => void;
};

/**
 * The field that replaces a row's time while a wall-time is typed: a text field
 * with a numeric keyboard, never `type="time"`. The view keeps only the typed
 * text and the error; the controller parses and the model resolves (ADR-0002).
 * Implements FR1, FR3, FR5, FR6, FR10, NFR-A2, NFR-A4, UX2 of
 * add-wall-time-input-with-hint (D6).
 */
export function WallTimeInput({
  label,
  initialText,
  onConfirm,
  onClose,
}: WallTimeInputProps) {
  const { t } = useTranslation();
  const errorId = useId();
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const [openedText] = useState(initialText);
  const [text, setText] = useState(openedText);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fieldRef.current?.focus();
    fieldRef.current?.select();
  }, []);

  const confirm = (shouldRestoreFocus: boolean) => {
    const outcome = onConfirm(text);
    if (outcome === WallTimeInputOutcome.INVALID_TEXT) {
      setHasError(true);
      return;
    }
    onClose(shouldRestoreFocus);
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

  const handleBlur = () => {
    if (text === openedText) onClose(false);
    else confirm(false);
  };

  return (
    <span className="flex flex-col items-end md:items-start">
      <input
        ref={fieldRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="min-h-11 w-24 rounded-md border border-accent bg-surface text-2xl font-bold leading-none tabular-nums md:w-36 md:text-4xl"
      />
      {hasError && (
        <span id={errorId} className="text-sm text-danger">
          {t("locations.wallTimeInputError")}
        </span>
      )}
    </span>
  );
}
