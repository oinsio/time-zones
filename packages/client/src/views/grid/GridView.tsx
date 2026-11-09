import { useHourGrid, useTimeSelection } from "@/controller";
import {
  type HourGridSlots,
  LocationRowVariant,
  ViewLocationList,
} from "@/views/shared";
import { HourFrame } from "./HourFrame";
import { HourStrip } from "./HourStrip";
import { useHourStripScroll } from "./useHourStripScroll";

/**
 * Grid view: the location list as rows of one panel, each a row header over
 * its hour strip, with the hour frame across all rows. A tap on a cell does
 * nothing yet; the strip is the keyboard time selection.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 * Implements FR1, FR8, FR9, FR11, FR12, NFR-R1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D3, D4, D5).
 */
export default function GridView() {
  const { strips, hourFrameIndex, cellCount } = useHourGrid();
  const { moveTrack } = useTimeSelection();
  const { panelRef, panelStyle } = useHourStripScroll(
    hourFrameIndex,
    cellCount,
  );
  const hourGrid: HourGridSlots = {
    renderHourStrip: (row) => {
      const strip = strips.get(row.id);
      return strip && row.dayTrack ? (
        <HourStrip
          city={row.cityLabel}
          track={row.dayTrack}
          strip={strip}
          hourFrameIndex={hourFrameIndex}
          onMoveTrack={moveTrack}
        />
      ) : null;
    },
    frame: <HourFrame hourFrameIndex={hourFrameIndex} />,
    panelRef,
    panelStyle,
  };
  return (
    <ViewLocationList
      rowVariant={LocationRowVariant.GRID_ROW}
      hourGrid={hourGrid}
    />
  );
}
