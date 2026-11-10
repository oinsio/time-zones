import { Share2, X } from "lucide-react";
import type { PresentedMeetingBar } from "@/presenter";

type MeetingBarProps = {
  bar: PresentedMeetingBar;
  onShare: () => void;
  onClear: () => void;
};

const ICON_BUTTON_CLASS_NAMES =
  "flex h-11 w-11 items-center justify-center rounded-md text-meeting focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * The meeting bar: the cells of the page header while a meeting range is set.
 * The title is the page's only heading, Share meeting and Clear meeting are
 * icon buttons at the right. Renders into the header's three-column grid.
 * Implements FR13, NFR-A1, NFR-R1, UX1 of add-grid-meeting-range-and-share (D7).
 */
export function MeetingBar({ bar, onShare, onClear }: MeetingBarProps) {
  return (
    <>
      <span />
      <h1 className="text-center text-xl font-semibold min-[360px]:text-2xl">
        {bar.title}
      </h1>
      <div className="flex justify-self-end gap-1">
        <button
          type="button"
          onClick={onShare}
          aria-label={bar.shareLabel}
          className={ICON_BUTTON_CLASS_NAMES}
        >
          <Share2 aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label={bar.clearLabel}
          className={ICON_BUTTON_CLASS_NAMES}
        >
          <X aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
