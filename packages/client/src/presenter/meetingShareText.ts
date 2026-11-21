import type { TFunction } from "i18next";
import {
  MEETING_SHARE_LINE_SEPARATOR,
  MILLISECONDS_PER_MINUTE,
} from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import {
  getWeekday,
  type InvitedLocation,
  type MeetingInvitation,
} from "@/model";
import type { HourFormat, ZoneLabelPart } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";
import { formatLocalDate } from "./localDateTime";
import { presentLocationMeetingRange } from "./locationMeetingRange";
import { formatMeetingDuration } from "./meetingBar";
import { presentMeetingShareLine } from "./meetingShareLine";

export type MeetingShareTextInput = {
  invitation: MeetingInvitation;
  /** IANA id of the reference zone: the heading names the date of the start there. */
  referenceZoneId: string;
  hourFormat: HourFormat;
  shareZoneLabelParts: readonly ZoneLabelPart[];
  /** The share language. */
  language: InterfaceLanguageCode;
  /** `i18n.getFixedT(language)`. */
  translate: TFunction;
  /** The city label of an invited location in the share language. */
  getCityLabel: (location: InvitedLocation) => string;
};

/**
 * The text Share meeting sends: the heading, then one line per invited
 * location in list order. A pure function of data, language and choices;
 * plain text, no link.
 * Implements FR3, FR4, FR6, FR7 of add-meeting-share-dialog (D2, D3).
 * Implements FR14, FR16, UX3 of add-grid-meeting-range-and-share (D3).
 */
export function presentMeetingShareText({
  invitation,
  referenceZoneId,
  hourFormat,
  shareZoneLabelParts,
  language,
  translate,
  getCityLabel,
}: MeetingShareTextInput): string {
  const { range, locations } = invitation;
  const startMilliseconds = range.start.epochMilliseconds;
  const formatReferenceStart = (kind: DateTimeLabelKind) =>
    getDateTimeFormatter(language, referenceZoneId, kind, hourFormat).format(
      startMilliseconds,
    );
  const durationMinutes =
    (range.end.epochMilliseconds - startMilliseconds) / MILLISECONDS_PER_MINUTE;
  const heading = translate("meeting.shareHeading", {
    context: getWeekday(
      range.start.toZonedDateTimeISO(referenceZoneId).toPlainDate(),
    ),
    weekday: formatReferenceStart(DateTimeLabelKind.WEEKDAY),
    date: formatReferenceStart(DateTimeLabelKind.DATE_WITHOUT_WEEKDAY),
    duration: formatMeetingDuration(durationMinutes, translate),
  });
  const lines = locations.map((location) => {
    const { spanLabel, dayShiftLabel } = presentLocationMeetingRange(
      location.timeZoneId,
      range,
      referenceZoneId,
      { language, hourFormat, translate },
    );
    return presentMeetingShareLine({
      timeZoneId: location.timeZoneId,
      instant: range.start,
      cityLabel: getCityLabel(location),
      shareZoneLabelParts,
      translate,
      spanLabel,
      dayShiftLabel,
      localDateLabel: formatLocalDate(
        range.start.toZonedDateTimeISO(location.timeZoneId),
        language,
      ),
    });
  });
  return [heading, ...lines].join(MEETING_SHARE_LINE_SEPARATOR);
}
