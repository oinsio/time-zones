import { RowNoteBox } from "./RowNoteBox";

type ClockChangeNoteProps = {
  text: string;
};

/**
 * The clock change note of a row: when the clocks of its zone were or will be
 * moved. Plain text of the card, not a live region, so a date change does not
 * announce it.
 * Implements FR2, NFR-A1, UX1 of show-clock-change-note-on-location-cards (D6).
 */
export function ClockChangeNote({ text }: ClockChangeNoteProps) {
  return <RowNoteBox text={text} />;
}
