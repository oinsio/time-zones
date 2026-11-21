import type { TFunction } from "i18next";
import { MEETING_SHARE_ZONE_PARTS_SEPARATOR } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import {
  getLocalDateTime,
  getUtcOffsetMinutes,
  getZoneAbbreviation,
} from "@/model";
import type { ZoneLabelPart } from "@/preferences";
import { formatUtcOffset } from "./utcOffset";
import { formatZoneAbbreviation } from "./zoneAbbreviation";
import { presentZoneLine, type ZoneLinePart } from "./zoneLine";

export type MeetingShareZonePartsInput = {
  timeZoneId: string;
  /** The start of the meeting range: the parts are those in force then. */
  instant: Temporal.Instant;
  /** The city label of the location in the language of `translate`. */
  cityLabel: string;
  shareZoneLabelParts: readonly ZoneLabelPart[];
  translate: TFunction;
};

/**
 * The zone abbreviation and the UTC offset of a location at the start of the
 * meeting range, ordered and filtered by the share zone label; a part whose
 * text equals the city label (the `UTC` location) is dropped. A list, joined
 * by the caller.
 * Implements FR6 of add-meeting-share-dialog (D2).
 */
export function presentMeetingShareZoneParts({
  timeZoneId,
  instant,
  cityLabel,
  shareZoneLabelParts,
  translate,
}: MeetingShareZonePartsInput): ZoneLinePart[] {
  const offsetMinutes = getUtcOffsetMinutes(timeZoneId, instant);
  const localDateTime = getLocalDateTime(timeZoneId, instant);
  const abbreviation = localDateTime
    ? getZoneAbbreviation(timeZoneId, localDateTime)
    : undefined;
  return presentZoneLine({
    placeText: "",
    zoneAbbreviationLabel: abbreviation
      ? formatZoneAbbreviation(abbreviation, translate)
      : "",
    utcOffsetLabel:
      offsetMinutes === undefined
        ? ""
        : formatUtcOffset(
            offsetMinutes,
            translate("locations.utcOffsetPrefix"),
          ),
    zoneLabelParts: shareZoneLabelParts,
    isDeviceTimeMeta: false,
  }).filter((part) => part.text !== cityLabel);
}

export type MeetingShareLineInput = MeetingShareZonePartsInput & {
  /** "09:00–11:00" in the share language. */
  spanLabel: string;
  /** "a day earlier" in the share language; absent when the local date is the reference zone's. */
  dayShiftLabel?: string;
  /** The local date of the start in the share language; used with a day shift. */
  localDateLabel: string;
};

/**
 * One line of the meeting share text: the city label, its zone parts in
 * brackets, the span and, when the local date differs, the day shift and date.
 * Implements FR3, FR6 of add-meeting-share-dialog (D2).
 */
export function presentMeetingShareLine(input: MeetingShareLineInput): string {
  const { translate, cityLabel, spanLabel, dayShiftLabel, localDateLabel } =
    input;
  const zoneParts = presentMeetingShareZoneParts(input);
  const zone =
    zoneParts.length === 0
      ? ""
      : translate("meeting.shareZone", {
          parts: zoneParts
            .map(({ text }) => text)
            .join(MEETING_SHARE_ZONE_PARTS_SEPARATOR),
        });
  return dayShiftLabel === undefined
    ? translate("meeting.shareLine", { city: cityLabel, zone, span: spanLabel })
    : translate("meeting.shareLineShifted", {
        city: cityLabel,
        zone,
        span: spanLabel,
        dayShift: dayShiftLabel,
        date: localDateLabel,
      });
}
