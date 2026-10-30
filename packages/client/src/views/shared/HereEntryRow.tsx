import { useId } from "react";
import {
  type TrackMove,
  type WallTimeInputOutcome,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "@/controller";
import type { PresentedHereEntry } from "@/presenter";
import { ZoneRowContent } from "./ZoneRowContent";

type HereEntryRowProps = {
  entry: PresentedHereEntry;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
  onConfirmWallTime: (
    target: WallTimeTarget,
    text: string,
    date: string,
  ) => WallTimeInputOutcome;
};

/**
 * The Here entry: the device time in a card of the location row's layout,
 * with the meta line in place of country and offset. It has no drag handle,
 * no menu and no remove action, and sits outside the numbered list.
 * Implements FR2, FR4, FR5, UX1, UX3, NFR-A2 of show-here-entry-for-device-time (D5).
 * Implements FR1, FR7 of add-wall-time-input-with-hint (D6): binds the Here entry target.
 */
export function HereEntryRow({
  entry,
  onSelectTrackFraction,
  onMoveTrack,
  onConfirmWallTime,
}: HereEntryRowProps) {
  const ids = { city: useId(), mark: useId(), difference: useId() };
  return (
    <section
      aria-label={entry.accessibleName}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-surface px-4 py-3"
    >
      <ZoneRowContent
        cityLabel={entry.cityLabel}
        ids={ids}
        mark={entry.mark}
        offsetDifferenceLabel={entry.offsetDifferenceLabel}
        offsetDifferenceAccessibleLabel={entry.offsetDifferenceAccessibleLabel}
        secondaryTexts={[entry.metaLabel]}
        localTimeLabel={entry.localTimeLabel}
        localDateLabel={entry.localDateLabel}
        localIsoDate={entry.localIsoDate}
        wallTimeInputLabel={entry.wallTimeInputLabel}
        wallTimeHint={entry.wallTimeHint}
        onConfirmWallTime={(text, date) =>
          onConfirmWallTime({ kind: WallTimeTargetKind.HERE_ENTRY }, text, date)
        }
        dayTrack={entry.dayTrack}
        onSelectTrackFraction={onSelectTrackFraction}
        onMoveTrack={onMoveTrack}
        isCityOneLine
      />
    </section>
  );
}
