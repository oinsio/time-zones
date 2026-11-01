import { RowNoteBox } from "./RowNoteBox";

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
  return <RowNoteBox text={text} role="status" />;
}
