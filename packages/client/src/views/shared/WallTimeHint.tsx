import { Info } from "lucide-react";

type WallTimeHintProps = {
  text: string;
};

/**
 * The wall-time hint of a row: what a DST gap or overlap did to the typed
 * time. A polite status message in the notice colours of both themes.
 * Implements FR7, NFR-A3, UX3 of add-wall-time-input-with-hint (D6).
 * Implements FR1, NFR-A2, UX1 of fix-location-card-and-header-layout (D1):
 * `order-last` keeps it after the day track.
 */
export function WallTimeHint({ text }: WallTimeHintProps) {
  return (
    <p
      role="status"
      className="order-last flex w-full items-start gap-2 rounded-md bg-notice px-3 py-2 text-[13px] leading-snug text-notice-foreground"
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </p>
  );
}
