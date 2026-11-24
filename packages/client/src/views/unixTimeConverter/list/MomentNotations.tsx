import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { COPY_CONFIRMATION_MS } from "@/constants";
import { CopyOutcome } from "@/ports";
import type {
  ConverterNotationId,
  PresentedNotation,
} from "@/presenter/unixTime";

type MomentNotationsProps = {
  notations: readonly PresentedNotation[];
  onCopy: (notationId: ConverterNotationId) => Promise<CopyOutcome>;
};

/**
 * The moment notations, each with a copy action that copies exactly the shown
 * text. A copy confirms in place with a check icon and a polite «Copied»; a
 * refused copy shows its text beside the action.
 * Implements FR12, NFR-A3, UX5 of add-unix-time-converter-tool (D10).
 */
export function MomentNotations({ notations, onCopy }: MomentNotationsProps) {
  const { t } = useTranslation();
  const [outcomes, setOutcomes] = useState<
    Partial<Record<ConverterNotationId, CopyOutcome>>
  >({});
  const [announcement, setAnnouncement] = useState("");
  const clearTimers = useRef(new Map<ConverterNotationId, number>());

  useEffect(() => {
    const timers = clearTimers.current;
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer);
    };
  }, []);

  const copy = async (notationId: ConverterNotationId) => {
    const outcome = await onCopy(notationId);
    setOutcomes((previous) => ({ ...previous, [notationId]: outcome }));
    setAnnouncement(outcome === CopyOutcome.COPIED ? t("unixTime.copied") : "");
    window.clearTimeout(clearTimers.current.get(notationId));
    clearTimers.current.set(
      notationId,
      window.setTimeout(() => {
        setOutcomes(({ [notationId]: _confirmed, ...rest }) => rest);
        setAnnouncement("");
      }, COPY_CONFIRMATION_MS),
    );
  };

  return (
    <section
      aria-label={t("unixTime.notationsLabel")}
      className="flex min-w-0 flex-col gap-2 rounded-card border border-card-border bg-surface px-4 py-3"
    >
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <dl className="flex min-w-0 flex-col gap-2">
        {notations.map((notation) => (
          <div key={notation.id} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-sm text-muted-foreground">{notation.label}</dt>
            <dd className="flex min-w-0 items-center gap-2">
              <code className="min-w-0 flex-1 break-all text-base font-semibold tabular-nums">
                {notation.text}
              </code>
              <button
                type="button"
                aria-label={notation.copyLabel}
                onClick={() => copy(notation.id)}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {outcomes[notation.id] === CopyOutcome.COPIED ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
              </button>
              {outcomes[notation.id] === CopyOutcome.FAILED && (
                <span className="text-sm text-danger">
                  {t("unixTime.copyFailed")}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
