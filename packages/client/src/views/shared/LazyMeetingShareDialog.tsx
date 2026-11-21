import { lazy, Suspense } from "react";
import type { MeetingShareSession } from "@/controller";

/** The share dialog loads when Share meeting is first chosen: the initial JavaScript is budgeted (NFR-P2). */
const MeetingShareDialog = lazy(() =>
  import("./MeetingShareDialog").then(({ MeetingShareDialog: dialog }) => ({
    default: dialog,
  })),
);

type LazyMeetingShareDialogProps = {
  session: MeetingShareSession;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
};

/**
 * The share dialog, loaded when it first opens.
 * Implements NFR-P2 of add-meeting-share-dialog (D7).
 */
export function LazyMeetingShareDialog(props: LazyMeetingShareDialogProps) {
  return (
    <Suspense fallback={null}>
      <MeetingShareDialog {...props} />
    </Suspense>
  );
}
