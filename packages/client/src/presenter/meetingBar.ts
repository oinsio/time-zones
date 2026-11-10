import type { TFunction } from "i18next";
import { MINUTES_PER_HOUR } from "@/constants";

export type PresentedMeetingBar = {
  title: string;
  shareLabel: string;
  clearLabel: string;
};

/** "2 h", "1 h 45 min" or "45 min" in the interface language. */
export function formatMeetingDuration(
  minutes: number,
  translate: TFunction,
): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const restMinutes = minutes % MINUTES_PER_HOUR;
  if (hours === 0) return translate("meeting.durationMinutes", { minutes });
  if (restMinutes === 0) return translate("meeting.durationHours", { hours });
  return translate("meeting.durationHoursMinutes", {
    hours,
    minutes: restMinutes,
  });
}

/**
 * Texts of the meeting bar.
 * Implements FR13 of add-grid-meeting-range-and-share (D3).
 */
export function presentMeetingBar(
  durationMinutes: number,
  translate: TFunction,
): PresentedMeetingBar {
  return {
    title: translate("meeting.barTitle", {
      duration: formatMeetingDuration(durationMinutes, translate),
    }),
    shareLabel: translate("meeting.share"),
    clearLabel: translate("meeting.clear"),
  };
}
