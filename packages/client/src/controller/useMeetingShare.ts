import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { browserTextSharing } from "@/adapters";
import { ShareOutcome, type TextSharing } from "@/ports";
import {
  formatMeetingDuration,
  type MeetingShareRow,
  presentMeetingShareText,
} from "@/presenter";
import { useLocations } from "./useLocations";
import { useMeetingRange } from "./useMeetingRange";
import { useReferenceMoment } from "./useReferenceMoment";

/** The notice a share outcome leaves; "shared" and "cancelled" leave none. */
export enum MeetingShareNotice {
  COPIED = "COPIED",
  FAILED = "FAILED",
}

const NOTICE_BY_OUTCOME: Partial<Record<ShareOutcome, MeetingShareNotice>> = {
  [ShareOutcome.COPIED]: MeetingShareNotice.COPIED,
  [ShareOutcome.FAILED]: MeetingShareNotice.FAILED,
};

/**
 * Share meeting: builds the meeting share text from the current state, hands
 * it to the `TextSharing` port and keeps the notice of the outcome until it is
 * dismissed, the next share, or a change of the meeting range.
 * Implements FR14, FR15 of add-grid-meeting-range-and-share (D5).
 */
export function useMeetingShare(textSharing: TextSharing = browserTextSharing) {
  const { t } = useTranslation();
  const { rows } = useLocations();
  const { meeting } = useMeetingRange();
  const { dateBar } = useReferenceMoment();
  const [notice, setNotice] = useState<MeetingShareNotice | undefined>();
  const meetingRange = meeting?.range;

  // biome-ignore lint/correctness/useExhaustiveDependencies: a changed or cleared range ends the notice
  useEffect(() => setNotice(undefined), [meetingRange]);

  const shareMeeting = useCallback(async () => {
    if (meeting === undefined) return;
    setNotice(undefined);
    const shareRows: MeetingShareRow[] = [];
    for (const row of rows) {
      const rowRange = meeting.rowRanges.get(row.id);
      if (rowRange === undefined) continue;
      shareRows.push({
        cityLabel: row.cityLabel,
        spanLabel: rowRange.spanLabel,
        dayShiftLabel: rowRange.dayShiftLabel,
        localDateLabel: row.localDateLabel,
      });
    }
    const text = presentMeetingShareText({
      fullDateLabel: dateBar.fullDateLabel,
      durationLabel: formatMeetingDuration(meeting.durationMinutes, t),
      rows: shareRows,
      translate: t,
    });
    setNotice(NOTICE_BY_OUTCOME[await textSharing.shareText(text)]);
  }, [meeting, rows, dateBar.fullDateLabel, t, textSharing]);

  const dismissNotice = useCallback(() => setNotice(undefined), []);
  return { shareMeeting, notice, dismissNotice };
}
