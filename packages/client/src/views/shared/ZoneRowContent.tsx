import type { TrackMove } from "@/controller";
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
  dayTrack?: PresentedDayTrack;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
  /** The city is one truncated line instead of wrapping (the Here entry). */
  isCityOneLine?: boolean;
};

/**
 * The place column, local time and day track shared by location cards and
 * the Here entry. Renders into the card's flex row, around its own extras.
 * Implements FR2, FR4, UX1, UX3 of show-here-entry-for-device-time (D5); the
 * layout moved from `LocationRow`.
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
  dayTrack,
  onSelectTrackFraction,
  onMoveTrack,
  isCityOneLine = false,
}: ZoneRowContentProps) {
  const hasDifference = offsetDifferenceLabel !== "";
  const cityLineClassName = isCityOneLine
    ? "flex items-center gap-x-2"
    : "flex flex-wrap items-center gap-x-2";
  const cityClassName = isCityOneLine
    ? "min-w-0 truncate font-semibold"
    : "font-semibold";
  return (
    <>
      <span className="flex min-w-0 flex-1 items-start gap-3 md:flex-none">
        <span className="flex min-w-0 flex-1 flex-col break-words md:w-64 md:flex-none">
          <span className={cityLineClassName}>
            {mark && <LocationMarkIcon mark={mark} id={ids.mark} />}
            <span id={ids.city} className={cityClassName}>
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
