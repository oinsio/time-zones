import type { RefObject } from "react";
import { type MeetingShare, useMeetingShareDialog } from "@/controller";
import { LazyMeetingShareDialog } from "@/views/shared";

type AppShellShareDialogProps = {
  shareMeeting: MeetingShare;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

/**
 * The share dialog with its session. It is loaded with the dialog (a lazy
 * chunk of `AppShellMeeting`), so the session hook stays out of the initial
 * JavaScript.
 * Implements FR1, FR9, NFR-P2 of add-meeting-share-dialog (D7).
 */
export function AppShellShareDialog({
  shareMeeting,
  returnFocusRef,
}: AppShellShareDialogProps) {
  const session = useMeetingShareDialog(shareMeeting);
  return (
    <LazyMeetingShareDialog session={session} returnFocusRef={returnFocusRef} />
  );
}
