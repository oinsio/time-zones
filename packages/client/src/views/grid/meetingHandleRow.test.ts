// Verifies FR9, NFR-R1 of add-grid-meeting-range-and-share (D6).
import { describe, expect, it } from "vitest";
import { MeetingHandle } from "@/model";
import { getMeetingHandleRow } from "./meetingHandleRow";

describe("getMeetingHandleRow", () => {
  it.each([
    [1, 1, 1],
    [2, 1, 2],
    [3, 2, 3],
    [4, 2, 3],
    [5, 3, 4],
  ])(
    "should place the handles of %i rows on rows %i (end) and %i (start)",
    (rowCount, endRow, startRow) => {
      expect(getMeetingHandleRow(MeetingHandle.END, rowCount)).toBe(endRow);
      expect(getMeetingHandleRow(MeetingHandle.START, rowCount)).toBe(startRow);
    },
  );
});
