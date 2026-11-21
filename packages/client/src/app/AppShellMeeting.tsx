import { lazy, Suspense, useRef } from "react";
import type { MeetingShare } from "@/controller";
import type { PresentedMeetingBar } from "@/presenter";
import { MeetingBar } from "@/views/shared";

/** Loaded when Share meeting is first chosen: the dialog and its session stay out of the initial JavaScript (NFR-P2). */
const AppShellShareDialog = lazy(async () => ({
  default: (await import("./AppShellShareDialog")).AppShellShareDialog,
}));

type AppShellMeetingProps = {
  bar: PresentedMeetingBar;
  share: MeetingShare;
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
        <Suspense fallback={null}>
          <AppShellShareDialog
            shareMeeting={share}
            returnFocusRef={shareButtonRef}
          />
        </Suspense>
      )}
    </>
  );
}
