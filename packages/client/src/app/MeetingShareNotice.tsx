import { useTranslation } from "react-i18next";
import { MeetingShareNotice as MeetingShareNoticeKind } from "@/controller";
import { Notice } from "./Notice";

const NOTICE_KEYS: Record<MeetingShareNoticeKind, string> = {
  [MeetingShareNoticeKind.COPIED]: "meeting.copiedNotice",
  [MeetingShareNoticeKind.FAILED]: "meeting.shareFailedNotice",
};

/**
 * Tells the outcome of Share meeting where the system share did not take the
 * text: copied, or failed. Never takes focus; Esc and Dismiss close it.
 * Implements FR15, NFR-A2 of add-grid-meeting-range-and-share (D7).
 */
export function MeetingShareNotice({
  kind,
  onDismiss,
}: {
  kind: MeetingShareNoticeKind;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  return <Notice message={t(NOTICE_KEYS[kind])} onDismiss={onDismiss} />;
}
