import { type ClipboardEvent, useEffect, useId, useRef } from "react";
import { KeyboardKey } from "@/constants";
import type { PresentedConverter } from "@/presenter/unixTime";

type ConverterInputFieldProps = {
  input: PresentedConverter["input"];
  onTypeInput: (text: string) => void;
  shouldFocusOnMount: boolean;
};

/**
 * The converter input: a text field named by the presenter, whose message is
 * its description and a polite live region; the ticking text is not one. While
 * the text is one the app wrote, a paste replaces it as a whole, so a tick that
 * rewrote the text cannot leave a paste in the middle of it.
 * Implements FR6, FR15, NFR-A2, NFR-A3, NFR-A4, UX4 of add-unix-time-converter-tool (D12).
 */
export function ConverterInputField({
  input,
  onTypeInput,
  shouldFocusOnMount,
}: ConverterInputFieldProps) {
  const messageId = useId();
  const fieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!shouldFocusOnMount) return;
    fieldRef.current?.focus();
    fieldRef.current?.select();
  }, [shouldFocusOnMount]);

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (input.isTyped) return;
    event.preventDefault();
    onTypeInput(event.clipboardData.getData("text"));
  };

  const hasMessage = input.message !== undefined;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <input
        ref={fieldRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label={input.name}
        aria-invalid={hasMessage}
        aria-describedby={hasMessage ? messageId : undefined}
        value={input.text}
        onChange={(event) => onTypeInput(event.target.value)}
        onPaste={handlePaste}
        onKeyDown={(event) => {
          if (event.key === KeyboardKey.ESCAPE) event.stopPropagation();
        }}
        className="min-h-11 w-full min-w-0 rounded-md border border-control-border bg-surface px-3 text-base font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger"
      />
      <p
        id={messageId}
        role="status"
        aria-live="polite"
        className="min-h-5 text-sm text-danger"
      >
        {input.message}
      </p>
    </div>
  );
}
