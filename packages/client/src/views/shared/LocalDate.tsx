import type { LocationRow, PresentedLocationMeetingRange } from "@/presenter";
import {
  LOCATION_ROW_VARIANT_CLASS_NAMES,
  LocationRowVariant,
} from "./locationRowVariant";

type LocalDateProps = Pick<LocationRow, "localDateLabel" | "localIsoDate"> & {
  /** Cards when omitted. */
  rowVariant?: LocationRowVariant;
  /** The meeting range's day shift mark, shown before the date. */
  meetingRange?: PresentedLocationMeetingRange;
};

/**
 * The local date of a row, with the meeting range's day shift mark before it.
 * It sits in line 2 below 768 px and in line 1 from it; the placement is the
 * row header's, not this component's.
 * Implements FR2, UX1 of show-local-time-and-date-on-location-cards (D5).
 * Implements FR8, UX1 of add-grid-meeting-range-and-share (D8): the day shift mark before the date.
 * Implements FR7, FR8, FR17 of redesign-cards-grid-and-day-palettes (D5): split from `LocalDateTime`.
 */
export function LocalDate({
  localDateLabel,
  localIsoDate,
  rowVariant = LocationRowVariant.CARD,
  meetingRange,
}: LocalDateProps) {
  const variantClassNames = LOCATION_ROW_VARIANT_CLASS_NAMES[rowVariant];
  return (
    <span className={`flex items-baseline gap-x-1 ${variantClassNames.date}`}>
      {meetingRange?.dayShiftLabel !== undefined && (
        <span className="bg-surface font-bold text-danger">
          {meetingRange.dayShiftLabel}
        </span>
      )}
      <time dateTime={localIsoDate} className="bg-surface">
        {localDateLabel}
      </time>
    </span>
  );
}
