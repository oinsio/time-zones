import type { LocationRow } from "@/presenter";
import { ClockChangeNote } from "./ClockChangeNote";
import { OptionalBox } from "./OptionalBox";
import { WallTimeHint } from "./WallTimeHint";

type RowNotesProps = Pick<LocationRow, "wallTimeHint" | "clockChangeNote"> & {
  /** The classes of the box around the notes; none where the notes need none. */
  boxClassName?: string;
};

/**
 * The notes of a location row: the wall-time hint and the clock change note,
 * last in the row. Renders nothing when the row has none.
 * Implements FR9 of add-grid-meeting-range-and-share (D8): moved from `LocationRow`
 * to keep that file short; the output is unchanged.
 */
export function RowNotes({
  wallTimeHint,
  clockChangeNote,
  boxClassName,
}: RowNotesProps) {
  if (wallTimeHint === undefined && clockChangeNote === undefined) return null;
  return (
    <OptionalBox className={boxClassName}>
      {wallTimeHint !== undefined && <WallTimeHint text={wallTimeHint} />}
      {clockChangeNote !== undefined && (
        <ClockChangeNote text={clockChangeNote} />
      )}
    </OptionalBox>
  );
}
