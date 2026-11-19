import type { HTMLAttributes, ReactNode } from "react";
import type {
  MeetingRangeInputOutcome,
  TrackMove,
  WallTimeInputOutcome,
} from "@/controller";
import type {
  LocationRow,
  PresentedDayTrack,
  PresentedLocationMark,
  PresentedLocationMeetingRange,
  ZoneLinePart,
} from "@/presenter";
import { DayTrack } from "./DayTrack";
import { LocalDate } from "./LocalDate";
import { LocalDateTime } from "./LocalDateTime";
import { LocationMarkIcon } from "./LocationMarkIcon";
import {
  LOCATION_ROW_VARIANT_CLASS_NAMES,
  LocationRowVariant,
} from "./locationRowVariant";
import { ZoneLine } from "./ZoneLine";

type ZoneRowContentProps = {
  cityLabel: string;
  /** Element IDs the card names itself by: city, mark and offset difference. */
  ids: { city: string; mark: string; difference: string };
  mark?: PresentedLocationMark;
  offsetDifferenceLabel: string;
  offsetDifferenceAccessibleLabel: string;
  /** Elements of the zone line under the city: place, zone abbreviation, UTC offset. */
  zoneLineParts: readonly ZoneLinePart[];
  localTimeLabel: string;
  localTimeParts: LocationRow["localTimeParts"];
  localDateLabel: string;
  localIsoDate: string;
  wallTimeInputLabel: string;
  /** `date` is the local ISO date the row showed when the field opened. */
  onConfirmWallTime: (text: string, date: string) => WallTimeInputOutcome;
  dayTrack?: PresentedDayTrack;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
  /** Cards when omitted. */
  rowVariant?: LocationRowVariant;
  /** Confirms the typed meeting range; `date` is the local ISO date the row showed when the input opened. */
  onConfirmMeetingRange?: (
    startText: string,
    endText: string,
    date: string,
  ) => MeetingRangeInputOutcome;
  /** The meeting range's local span and day shift mark. */
  meetingRange?: PresentedLocationMeetingRange;
  /** The grab area's activator ref, pointer listeners and cursor; absent where the row cannot be reordered. */
  grabAreaProps?: GrabAreaProps;
  /** The location menu button, placed after the time. */
  menu: ReactNode;
};

/** What makes the place and the zone line the grab area of a row. */
export type GrabAreaProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: (element: HTMLElement | null) => void;
  /** Marks the element for tests that look for the grab area. */
  "data-grab-area"?: string;
};

/**
 * The place column, local time and day track of a location card. Renders
 * into the card's flex row, around its own extras.
 * Implements FR2, FR4, UX1, UX3 of show-here-entry-for-device-time (D5); the
 * layout moved from `LocationRow`.
 * Implements FR1, FR7, UX3 of add-wall-time-input-with-hint (D6): the time
 * button before the day track.
 * Implements FR1, NFR-A2, UX1 of fix-location-card-and-header-layout (D1): the
 * hint moved to `LocationRow`, the card's last element.
 * Implements FR5, FR6, NFR-R1, UX1 of show-zone-abbreviations-and-zone-label-setting (D6): the zone line parts.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): the zone line on the city's line in a grid row.
 * Implements FR10 of add-grid-hour-cells-and-hour-frame (D5): the texts keep the surface background, so the hour frame breaks behind them.
 * Implements FR8 of add-grid-meeting-range-and-share (D8): passes the meeting range to the time.
 * Implements FR8, UX3 of fix-grid-meeting-range-lock-and-layering (D6): the zone line container has no surface, only its parts.
 * Implements FR3, FR4 of fix-grid-meeting-range-lock-and-layering (D4): passes the meeting range input to the time.
 * Implements FR7, FR8, FR9, FR10, FR11, FR15, FR17 of redesign-cards-grid-and-day-palettes (D5, D6): the two
 * lines of the row header, the grab area (place and zone line), the date by the width and the menu after the time.
 */
export function ZoneRowContent({
  cityLabel,
  ids,
  mark,
  offsetDifferenceLabel,
  offsetDifferenceAccessibleLabel,
  zoneLineParts,
  localTimeLabel,
  localTimeParts,
  localDateLabel,
  localIsoDate,
  wallTimeInputLabel,
  onConfirmWallTime,
  dayTrack,
  onSelectTrackFraction,
  onMoveTrack,
  rowVariant = LocationRowVariant.CARD,
  meetingRange,
  onConfirmMeetingRange,
  grabAreaProps,
  menu,
}: ZoneRowContentProps) {
  const variantClassNames = LOCATION_ROW_VARIANT_CLASS_NAMES[rowVariant];
  const hasDifference = offsetDifferenceLabel !== "";
  const isTimeKnown = localTimeLabel !== "";
  return (
    <>
      <span className={variantClassNames.header}>
        <span className={variantClassNames.lineOne}>
          <span
            {...grabAreaProps}
            className={`${variantClassNames.place} ${grabAreaProps?.className ?? ""}`}
          >
            {mark && (
              <LocationMarkIcon
                mark={mark}
                id={ids.mark}
                sizePx={variantClassNames.markSizePx}
              />
            )}
            <span id={ids.city} className={variantClassNames.city}>
              {cityLabel}
            </span>
            {hasDifference && (
              <>
                <span
                  aria-hidden="true"
                  data-offset-difference
                  className={variantClassNames.difference}
                >
                  {offsetDifferenceLabel}
                </span>
                <span
                  id={ids.difference}
                  data-offset-difference
                  className="sr-only"
                >
                  {offsetDifferenceAccessibleLabel}
                </span>
              </>
            )}
          </span>
          <span className={variantClassNames.timeGroup}>
            <LocalDateTime
              localTimeLabel={localTimeLabel}
              localTimeParts={localTimeParts}
              localIsoDate={localIsoDate}
              wallTimeInputLabel={wallTimeInputLabel}
              onConfirmWallTime={onConfirmWallTime}
              rowVariant={rowVariant}
              cityLabel={cityLabel}
              onConfirmMeetingRange={onConfirmMeetingRange}
              meetingRange={meetingRange}
            />
            {menu}
          </span>
        </span>
        <span className={variantClassNames.lineTwo}>
          {zoneLineParts.length > 0 && (
            <span
              {...grabAreaProps}
              ref={undefined}
              className={`${variantClassNames.zoneLine} ${grabAreaProps?.className ?? ""}`}
            >
              <ZoneLine parts={zoneLineParts} />
            </span>
          )}
          {isTimeKnown && (
            <LocalDate
              localDateLabel={localDateLabel}
              localIsoDate={localIsoDate}
              rowVariant={rowVariant}
              meetingRange={meetingRange}
            />
          )}
        </span>
      </span>
      {dayTrack && variantClassNames.hasDayTrack && (
        <DayTrack
          track={dayTrack}
          city={cityLabel}
          onSelectFraction={onSelectTrackFraction}
          onMoveTrack={onMoveTrack}
        />
      )}
    </>
  );
}
