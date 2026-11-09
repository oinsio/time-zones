import type { TrackMove, WallTimeInputOutcome } from "@/controller";
import type {
  PresentedDayTrack,
  PresentedLocationMark,
  ZoneLinePart,
} from "@/presenter";
import { DayTrack } from "./DayTrack";
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
 */
export function ZoneRowContent({
  cityLabel,
  ids,
  mark,
  offsetDifferenceLabel,
  offsetDifferenceAccessibleLabel,
  zoneLineParts,
  localTimeLabel,
  localDateLabel,
  localIsoDate,
  wallTimeInputLabel,
  onConfirmWallTime,
  dayTrack,
  onSelectTrackFraction,
  onMoveTrack,
  rowVariant = LocationRowVariant.CARD,
}: ZoneRowContentProps) {
  const variantClassNames = LOCATION_ROW_VARIANT_CLASS_NAMES[rowVariant];
  const hasDifference = offsetDifferenceLabel !== "";
  return (
    <>
      <span
        className={`flex min-w-0 flex-1 items-start gap-3 ${variantClassNames.placeAndTime}`}
      >
        <span
          className={`flex min-w-0 flex-1 flex-col break-words ${variantClassNames.place}`}
        >
          <span
            className={`flex flex-wrap items-center gap-x-2 ${variantClassNames.cityLine}`}
          >
            {mark && <LocationMarkIcon mark={mark} id={ids.mark} />}
            <span id={ids.city} className="bg-surface font-semibold">
              {cityLabel}
            </span>
            {hasDifference && (
              <>
                <span
                  aria-hidden="true"
                  data-offset-difference
                  className="bg-surface text-sm font-semibold text-muted-foreground"
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
            {mark?.caption && (
              <span
                aria-hidden="true"
                className="bg-surface text-xs font-bold text-accent"
              >
                {mark.caption}
              </span>
            )}
          </span>
          {zoneLineParts.length > 0 && (
            <ZoneLine
              parts={zoneLineParts}
              className="bg-surface text-sm text-muted-foreground"
            />
          )}
        </span>
        <LocalDateTime
          localTimeLabel={localTimeLabel}
          localDateLabel={localDateLabel}
          localIsoDate={localIsoDate}
          wallTimeInputLabel={wallTimeInputLabel}
          onConfirmWallTime={onConfirmWallTime}
          rowVariant={rowVariant}
        />
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
