import type { TFunction } from "i18next";
import { useMemo } from "react";
import { SHARE_ZONE_LABEL_PARTS } from "@/preferences";
import { presentMeetingShareZoneParts, type ZoneLinePart } from "@/presenter";
import type { useLocations } from "./useLocations";
import type { useMeetingRange } from "./useMeetingRange";

/** One row of the share dialog, written in the interface language. */
export type MeetingShareDialogRow = {
  id: string;
  cityLabel: string;
  isIncluded: boolean;
  zoneParts: readonly ZoneLinePart[];
  spanLabel: string;
  dayShiftLabel?: string;
  localDateLabel: string;
};

type LocationsView = ReturnType<typeof useLocations>;

/**
 * The dialog rows: every location with its tick, zone line and meeting span.
 * Implements FR1, FR2, FR3 of add-meeting-share-dialog (D6).
 */
export function useMeetingShareDialogRows(
  meeting: ReturnType<typeof useMeetingRange>["meeting"],
  { locations, rows }: LocationsView,
  excludedLocationIds: readonly string[],
  translate: TFunction,
): MeetingShareDialogRow[] {
  return useMemo(() => {
    if (meeting === undefined) return [];
    return locations.flatMap((location) => {
      const row = rows.find(({ id }) => id === location.id);
      const rowRange = meeting.rowRanges.get(location.id);
      if (row === undefined || rowRange === undefined) return [];
      return [
        {
          id: location.id,
          cityLabel: row.cityLabel,
          isIncluded: !excludedLocationIds.includes(location.id),
          zoneParts: presentMeetingShareZoneParts({
            timeZoneId: location.timeZoneId,
            instant: meeting.range.start,
            cityLabel: row.cityLabel,
            shareZoneLabelParts: SHARE_ZONE_LABEL_PARTS,
            translate,
          }),
          spanLabel: rowRange.spanLabel,
          dayShiftLabel: rowRange.dayShiftLabel,
          localDateLabel: row.localDateLabel,
        },
      ];
    });
  }, [meeting, locations, rows, excludedLocationIds, translate]);
}
