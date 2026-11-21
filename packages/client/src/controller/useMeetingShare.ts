import { useCallback, useEffect, useState } from "react";
import { browserTextSharing } from "@/adapters";
import { ShareOutcome, type TextSharing } from "@/ports";
import { useMeetingRange } from "./useMeetingRange";

/** The notice a share outcome leaves; "shared" and "cancelled" leave none. */
export enum MeetingShareNotice {
  COPIED = "COPIED",
  FAILED = "FAILED",
}

const NOTICE_BY_OUTCOME: Partial<Record<ShareOutcome, MeetingShareNotice>> = {
  [ShareOutcome.COPIED]: MeetingShareNotice.COPIED,
  [ShareOutcome.FAILED]: MeetingShareNotice.FAILED,
};

/** The light part of Share meeting that the app shell owns: see `useMeetingShare`. */
export type MeetingShare = ReturnType<typeof useMeetingShare>;

/**
 * Share meeting: whether the share dialog is open and the notice of the last
 * share outcome, which lasts until it is dismissed, the next opening, or a
 * change of the meeting range. The dialog's own session (ticks, language,
 * text, destinations) is `useMeetingShareDialog`, which loads with the dialog
 * so that the initial bundle stays within its budget (NFR-P2).
 * Implements FR14, FR15 of add-grid-meeting-range-and-share (D5).
 * Implements FR1, FR9, FR10, NFR-P2 of add-meeting-share-dialog (D6).
 */
export function useMeetingShare(textSharing: TextSharing = browserTextSharing) {
  const { meeting } = useMeetingRange();
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<MeetingShareNotice | undefined>();
  const meetingRange = meeting?.range;
  const hasMeetingRange = meetingRange !== undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: a changed or cleared range ends the notice
  useEffect(() => setNotice(undefined), [meetingRange]);
  useEffect(() => {
    if (!hasMeetingRange) setIsOpen(false);
  }, [hasMeetingRange]);

  const openShareDialog = useCallback(() => {
    setNotice(undefined);
    setIsOpen(true);
  }, []);
  const closeShareDialog = useCallback(() => setIsOpen(false), []);
  /** Closes the dialog and shows the notice of the outcome; a cancelled share keeps the dialog. */
  const finishShare = useCallback((outcome: ShareOutcome) => {
    if (outcome === ShareOutcome.CANCELLED) return;
    setIsOpen(false);
    setNotice(NOTICE_BY_OUTCOME[outcome]);
  }, []);
  const dismissNotice = useCallback(() => setNotice(undefined), []);

  return {
    isShareDialogOpen: isOpen && hasMeetingRange,
    openShareDialog,
    closeShareDialog,
    finishShare,
    notice,
    dismissNotice,
    textSharing,
  };
}
