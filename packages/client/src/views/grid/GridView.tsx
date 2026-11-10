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
import { useHourStripScroll } from "./useHourStripScroll";

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
 */
export default function GridView() {
  const { strips, hourFrameIndex, cellCount, hasMeetingRange } = useHourGrid();
  const { moveTrack } = useTimeSelection();
  const {
    meeting,
    selectCells,
    selectFramedHour,
    moveHandle,
    dragHandleTo,
    confirmMeetingRangeInput,
  } = useMeetingRange();
  const { panelRef, panelStyle, layout } = useHourStripScroll(
    hourFrameIndex,
    cellCount,
    !hasMeetingRange,
  );
  const meetingColumns = meeting && {
    first: meeting.span.firstColumn,
    last: meeting.span.lastColumn,
  };
  const handleProps = {
    rowCount: strips.size,
    cellPitchPx: layout.cellPitchPx,
    isScrollable: layout.isScrollable,
    onMoveHandle: moveHandle,
    onDragHandleTo: dragHandleTo,
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
        <MeetingFrame span={meeting.span} />
        <MeetingHandleSlider
          presented={meeting.handles.start}
          {...handleProps}
        />
        <MeetingHandleSlider presented={meeting.handles.end} {...handleProps} />
      </>
    ) : (
      <HourFrame hourFrameIndex={hourFrameIndex} />
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
