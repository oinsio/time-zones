import { useRef } from "react";
import type { MeetingShareSession } from "@/controller";
import type { PresentedMeetingBar } from "@/presenter";
import { LazyMeetingShareDialog, MeetingBar } from "@/views/shared";

type AppShellMeetingProps = {
  bar: PresentedMeetingBar;
  share: MeetingShareSession;
  onClear: () => void;
};

/**
 * The meeting bar and, while the share session is open, the share dialog (a
 * lazy chunk) with Share meeting as the place the focus returns to.
 * Implements FR1, FR9, NFR-A1, NFR-P2 of add-meeting-share-dialog (D7).
 */
export function AppShellMeeting({ bar, share, onClear }: AppShellMeetingProps) {
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <MeetingBar
        bar={bar}
        onShare={share.openShareDialog}
        onClear={onClear}
        shareButtonRef={shareButtonRef}
      />
      {share.isShareDialogOpen && (
        <LazyMeetingShareDialog
          session={share}
          returnFocusRef={shareButtonRef}
        />
      )}
    </>
  );
}
