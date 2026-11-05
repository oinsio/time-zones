import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render } from "@testing-library/react";
import {
  type LocationRow as LocationRowModel,
  ZoneLinePartKind,
} from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { LocationRow } from "./LocationRow";

export const kolkataRow: LocationRowModel = {
  id: "kolkata",
  cityLabel: "Kolkata",
  countryName: "India",
  utcOffsetLabel: "UTC+5:30",
  zoneAbbreviationLabel: "IST",
  zoneLineParts: [
    { kind: ZoneLinePartKind.PLACE, text: "India" },
    { kind: ZoneLinePartKind.ZONE_ABBREVIATION, text: "IST" },
    { kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC+5:30" },
  ],
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "",
  localDateLabel: "",
  localIsoDate: "",
  wallTimeInputLabel: "",
};

export const renderKolkataRow = (
  overrides: Partial<LocationRowModel> = {},
  isReorderable = true,
  onConfirmWallTime = ignoreWallTime,
) =>
  render(
    <DndContext>
      <SortableContext items={[kolkataRow.id]}>
        <ul>
          <LocationRow
            row={{ ...kolkataRow, ...overrides }}
            onRemove={vi.fn()}
            onSetHome={() => undefined}
            onSelectTrackFraction={vi.fn()}
            onMoveTrack={vi.fn()}
            onConfirmWallTime={onConfirmWallTime}
            isReorderable={isReorderable}
            prefersReducedMotion={false}
          />
        </ul>
      </SortableContext>
    </DndContext>,
  );
