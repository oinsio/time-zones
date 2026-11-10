import type { TFunction } from "i18next";
import { MEETING_SHARE_LINE_SEPARATOR } from "@/constants";

export type MeetingShareRow = {
  cityLabel: string;
  spanLabel: string;
  /** Present when the row's local date differs from the reference zone's. */
  dayShiftLabel?: string;
  localDateLabel?: string;
};

export type MeetingShareTextInput = {
  /** The date bar's full date. */
  fullDateLabel: string;
  durationLabel: string;
  rows: readonly MeetingShareRow[];
  translate: TFunction;
};

/**
 * The text Share meeting sends: the heading, then one line per location in list
 * order. Plain text, no link.
 * Implements FR14, FR16, UX3 of add-grid-meeting-range-and-share (D3).
 */
export function presentMeetingShareText({
  fullDateLabel,
  durationLabel,
  rows,
  translate,
}: MeetingShareTextInput): string {
  const heading = translate("meeting.shareHeading", {
    date: fullDateLabel,
    duration: durationLabel,
  });
  const lines = rows.map((row) =>
    row.dayShiftLabel === undefined
      ? translate("meeting.shareLine", {
          city: row.cityLabel,
          span: row.spanLabel,
        })
      : translate("meeting.shareLineShifted", {
          city: row.cityLabel,
          span: row.spanLabel,
          dayShift: row.dayShiftLabel,
          date: row.localDateLabel,
        }),
  );
  return [heading, ...lines].join(MEETING_SHARE_LINE_SEPARATOR);
}
