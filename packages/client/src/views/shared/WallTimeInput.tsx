import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { WallTimeInputOutcome } from "@/controller";

type WallTimeInputProps = {
  /** Accessible name: "Enter time — city, time". */
  label: string;
  initialText: string;
  onConfirm: (text: string) => WallTimeInputOutcome;
  /** `shouldRestoreFocus` is false when the user already moved the focus away. */
  onClose: (shouldRestoreFocus: boolean) => void;
};

const KEYS_KEPT_IN_FIELD = new Set([
  " ",
  "Enter",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

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
  const [text, setText] = useState(initialText);
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
    if (KEYS_KEPT_IN_FIELD.has(event.key)) event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      confirm(true);
    } else if (event.key === "Escape") {
      onClose(true);
    }
  };

  const handleBlur = () => {
    if (text === initialText) onClose(false);
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
