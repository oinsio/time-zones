import type { TrackMove, WallTimeInputOutcome } from "@/controller";
import type { PresentedDayTrack, PresentedLocationMark } from "@/presenter";
import { DayTrack } from "./DayTrack";
import { LocalDateTime } from "./LocalDateTime";
import { LocationMarkIcon } from "./LocationMarkIcon";

type ZoneRowContentProps = {
  cityLabel: string;
  /** Element IDs the card names itself by: city, mark and offset difference. */
  ids: { city: string; mark: string; difference: string };
  mark?: PresentedLocationMark;
  offsetDifferenceLabel: string;
  offsetDifferenceAccessibleLabel: string;
  /** Texts of the line under the city: country and offset, or the meta line. */
  secondaryTexts: readonly string[];
  localTimeLabel: string;
  localDateLabel: string;
  localIsoDate: string;
  wallTimeInputLabel: string;
  /** `date` is the local ISO date the row showed when the field opened. */
  onConfirmWallTime: (text: string, date: string) => WallTimeInputOutcome;
  dayTrack?: PresentedDayTrack;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
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
 */
export function ZoneRowContent({
  cityLabel,
  ids,
  mark,
  offsetDifferenceLabel,
  offsetDifferenceAccessibleLabel,
  secondaryTexts,
  localTimeLabel,
  localDateLabel,
  localIsoDate,
  wallTimeInputLabel,
  onConfirmWallTime,
  dayTrack,
  onSelectTrackFraction,
  onMoveTrack,
}: ZoneRowContentProps) {
  const hasDifference = offsetDifferenceLabel !== "";
  return (
    <>
      <span className="flex min-w-0 flex-1 items-start gap-3 md:flex-none">
        <span className="flex min-w-0 flex-1 flex-col break-words md:w-64 md:flex-none">
          <span className="flex flex-wrap items-center gap-x-2">
            {mark && <LocationMarkIcon mark={mark} id={ids.mark} />}
            <span id={ids.city} className="font-semibold">
              {cityLabel}
            </span>
            {hasDifference && (
              <>
                <span
                  aria-hidden="true"
                  data-offset-difference
                  className="text-sm font-semibold text-muted-foreground"
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
                className="text-xs font-bold text-accent"
              >
                {mark.caption}
              </span>
            )}
          </span>
          {secondaryTexts.length > 0 && (
            <span className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
              {secondaryTexts.map((text) => (
                <span key={text}>{text}</span>
              ))}
            </span>
          )}
        </span>
        <LocalDateTime
          localTimeLabel={localTimeLabel}
          localDateLabel={localDateLabel}
          localIsoDate={localIsoDate}
          wallTimeInputLabel={wallTimeInputLabel}
          onConfirmWallTime={onConfirmWallTime}
        />
      </span>
      {dayTrack && (
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
