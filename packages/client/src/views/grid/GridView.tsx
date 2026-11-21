import { useState } from "react";
import { useHourGrid, useMeetingRange, useTimeSelection } from "@/controller";
import {
  type HourGridSlots,
  LocationRowVariant,
  ViewLocationList,
} from "@/views/shared";
import { HourFrame } from "./HourFrame";
import { HourStrip } from "./HourStrip";
import { MeetingFrame } from "./MeetingFrame";
import { MeetingHandleSlider } from "./MeetingHandle";
import { MoveHandleSlider } from "./MoveHandle";
import { useHourStripScroll } from "./useHourStripScroll";
import { useMeetingFrameMove } from "./useMeetingFrameMove";
import { useVisibleStripRows } from "./useVisibleStripRows";

/**
 * Grid view: the location list as rows of one panel, each a row header over
 * its hour strip, with the hour frame across all rows. A tap or a drag on the
 * cells, or Enter on a strip, sets the meeting range; while it is set the
 * meeting frame and the two meeting handles replace the hour frame and every
 * row shows its local span.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 * Implements FR1, FR8, FR9, FR11, FR12, NFR-R1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D3, D4, D5).
 * Implements FR5-FR12, NFR-R1, UX1, UX2 of add-grid-meeting-range-and-share (D6, D8).
 * Implements FR1, FR2, UX1 of fix-grid-meeting-range-lock-and-layering (D1): the rows lock while a meeting range is set.
 * Implements FR4 of fix-grid-meeting-range-lock-and-layering (D4): binds the meeting range input.
 * Implements FR7, NFR-P1 of refine-meeting-range-entry-and-handles (D5): the handles stand on the visible rows.
 * Implements FR13 of add-day-colouring-setting (D7): colours the hour frame.
 * Implements FR6, FR9 of move-meeting-range-and-extend-past-midnight (D4, D10): the strip tail, frozen during a cell gesture.
 * Implements FR15-FR19 of move-meeting-range-and-extend-past-midnight (D5-D8, D11): the move handle and the move by the frame.
 */
export default function GridView() {
  const [frozenTailCellCount, setFrozenTailCellCount] = useState<
    number | undefined
  >(undefined);
  const {
    strips,
    hourFrameIndex,
    cellCount,
    tailCellCount,
    hasMeetingRange,
    hourFrameColour,
  } = useHourGrid(frozenTailCellCount);
  const { moveTrack } = useTimeSelection();
  const {
    meeting,
    selectCells,
    selectFramedHour,
    moveHandle,
    moveMeeting,
    moveMeetingToStartMinutes,
    dragHandleTo,
    confirmMeetingRangeInput,
  } = useMeetingRange();
  const { panelRef, panelElement, panelStyle, layout } = useHourStripScroll(
    hourFrameIndex,
    cellCount,
    !hasMeetingRange,
  );
  const [isHandleDragging, setIsHandleDragging] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const onMoveActiveChange = (isActive: boolean) => {
    setIsMoving(isActive);
    setIsHandleDragging(isActive);
  };
  const frameMinutes = meeting && {
    startMinutes: meeting.span.startMinutes,
    endMinutes: meeting.span.endMinutes,
  };
  const { isMovingRef } = useMeetingFrameMove({
    panelElement,
    frame: frameMinutes,
    cellPitchPx: layout.cellPitchPx,
    isScrollable: layout.isScrollable,
    tailCellCount,
    onMoveTo: moveMeetingToStartMinutes,
    onActiveChange: onMoveActiveChange,
  });
  const candidateRows = useVisibleStripRows(
    panelElement,
    strips.size,
    isHandleDragging || !hasMeetingRange,
  );
  const meetingColumns = meeting && {
    first: meeting.span.firstColumn,
    last: meeting.span.lastColumn,
  };
  const handleProps = {
    candidateRows,
    cellPitchPx: layout.cellPitchPx,
    isScrollable: layout.isScrollable,
    tailCellCount,
    onMoveHandle: moveHandle,
    onDragHandleTo: dragHandleTo,
    onDragActiveChange: setIsHandleDragging,
  };
  const hourGrid: HourGridSlots = {
    renderHourStrip: (row) => {
      const strip = strips.get(row.id);
      return strip && row.dayTrack ? (
        <HourStrip
          city={row.cityLabel}
          track={row.dayTrack}
          strip={strip}
          hourFrameIndex={meeting ? undefined : hourFrameIndex}
          meetingColumns={meetingColumns}
          tailCellCount={tailCellCount}
          meetingFrame={frameMinutes}
          isFrameMoving={() => isMovingRef.current}
          isMoving={isMoving}
          onSelectionActiveChange={(isActive) =>
            setFrozenTailCellCount(isActive ? tailCellCount : undefined)
          }
          cellPitchPx={layout.cellPitchPx}
          isScrollable={layout.isScrollable}
          onMoveTrack={moveTrack}
          onSelectCells={selectCells}
          onSelectFramedHour={selectFramedHour}
        />
      ) : null;
    },
    frame: meeting ? (
      <>
        <MeetingFrame span={meeting.span} isMoving={isMoving} />
        <MeetingHandleSlider
          presented={meeting.handles.start}
          {...handleProps}
        />
        <MeetingHandleSlider presented={meeting.handles.end} {...handleProps} />
        <MoveHandleSlider
          presented={meeting.handles.move}
          cellPitchPx={layout.cellPitchPx}
          isScrollable={layout.isScrollable}
          tailCellCount={tailCellCount}
          isMoving={isMoving}
          onMoveMeeting={moveMeeting}
          onDragMeetingTo={moveMeetingToStartMinutes}
          onDragActiveChange={onMoveActiveChange}
        />
      </>
    ) : (
      <HourFrame hourFrameIndex={hourFrameIndex} colour={hourFrameColour} />
    ),
    meetingRangeOf: (row) => meeting?.rowRanges.get(row.id),
    panelRef,
    panelStyle,
    areRowControlsLocked: meeting !== undefined,
    onConfirmMeetingRange: confirmMeetingRangeInput,
  };
  return (
    <ViewLocationList
      rowVariant={LocationRowVariant.GRID_ROW}
      hourGrid={hourGrid}
    />
  );
}
