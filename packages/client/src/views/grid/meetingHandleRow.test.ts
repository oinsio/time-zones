// Verifies FR9, NFR-R1 of add-grid-meeting-range-and-share (D6).
// Verifies FR7 of refine-meeting-range-entry-and-handles.
import { describe, expect, it } from "vitest";
import { MeetingHandle } from "@/model";
import { getMeetingHandleRow } from "./meetingHandleRow";

describe("getMeetingHandleRow", () => {
  it.each([
    [1, 1, 1, 1],
    [1, 2, 1, 2],
    [1, 3, 2, 3],
    [1, 4, 2, 3],
    [1, 5, 3, 4],
    [7, 12, 9, 10],
    [5, 5, 5, 5],
    [3, 4, 3, 4],
  ])(
    "should place the handles among rows %i to %i on rows %i (end) and %i (start)",
    (firstRow, lastRow, endRow, startRow) => {
      const candidateRows = { firstRow, lastRow };
      expect(getMeetingHandleRow(MeetingHandle.END, candidateRows)).toBe(
        endRow,
      );
      expect(getMeetingHandleRow(MeetingHandle.START, candidateRows)).toBe(
        startRow,
      );
    },
  );
});
