import type { RefObject } from "react";
import { type MeetingShare, useMeetingShareDialog } from "@/controller";
import { LazyMeetingShareDialog } from "@/views/shared";

type AppShellShareDialogProps = {
  shareMeeting: MeetingShare;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  /** Clears the meeting range as Clear meeting does; the session calls it after a share with the outcome shared. */
  onClear: () => void;
};

/**
 * The share dialog with its session. It is loaded with the dialog (a lazy
 * chunk of `AppShellMeeting`), so the session hook stays out of the initial
 * JavaScript.
 * Implements FR1, FR9, NFR-P2 of add-meeting-share-dialog (D7).
 * Implements FR5 of keep-location-menu-in-view-and-clear-range-after-share (D3).
 */
export function AppShellShareDialog({
  shareMeeting,
  returnFocusRef,
  onClear,
}: AppShellShareDialogProps) {
  const session = useMeetingShareDialog(shareMeeting, onClear);
  return (
    <LazyMeetingShareDialog session={session} returnFocusRef={returnFocusRef} />
  );
}
