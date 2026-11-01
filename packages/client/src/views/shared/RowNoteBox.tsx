import { Info } from "lucide-react";

type RowNoteBoxProps = {
  text: string;
  /** `status` makes the note a polite live region; absent it is plain text. */
  role?: "status";
};

/**
 * The one look of a row note: a line in the notice colours of both themes
 * after the day track, with an icon hidden from assistive technology.
 * Implements FR7, NFR-A3, UX3 of add-wall-time-input-with-hint (D6).
 * Implements FR1, NFR-A2, UX1 of fix-location-card-and-header-layout (D1):
 * `order-last` keeps it after the day track.
 * Implements NFR-A1, UX1 of show-clock-change-note-on-location-cards (D6):
 * shared by the wall-time hint and the clock change note.
 */
export function RowNoteBox({ text, role }: RowNoteBoxProps) {
  return (
    <p
      role={role}
      className="order-last flex w-full items-start gap-2 rounded-md bg-notice px-3 py-2 text-[13px] leading-snug text-notice-foreground"
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </p>
  );
}
