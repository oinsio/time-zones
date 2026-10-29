import type { TFunction } from "i18next";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
import {
  getLocalDateTime,
  getOffsetDifferenceMinutes,
  getUtcOffsetMinutes,
  type ReferenceDay,
} from "@/model";
import { type PresentedDayTrack, presentDayTrack } from "./dayTrack";
import { formatLocalDate, formatLocalTime } from "./localDateTime";
import { formatOffsetDifference } from "./offsetDifference";
import { formatUtcOffset } from "./utcOffset";

export type LocationRowsContext = {
  language: SupportedLanguage;
  instant: Temporal.Instant;
  translate: TFunction;
  deviceTimeZoneId: string;
  homeLocationId: string | null;
  /** Offset of the reference zone, read once per presentation (NFR-P1). */
  referenceOffsetMinutes: number | undefined;
  referenceDay: ReferenceDay;
};

/** What a time zone shows at the reference moment: shared by rows and the Here entry. */
export type PresentedZoneMoment = {
  /** "UTC+3" style label; empty when the offset cannot be computed. */
  utcOffsetLabel: string;
  /** "−2 h" style label; empty when there is no offset difference. */
  offsetDifferenceLabel: string;
  /** "2 hours behind" style text read in the name; empty without a difference. */
  offsetDifferenceAccessibleLabel: string;
  /** "12:30" style label; empty when the zone is unknown. */
  localTimeLabel: string;
  /** "Sun, Mar 8" style label; empty when the zone is unknown. */
  localDateLabel: string;
  /** ISO date ("2026-03-08") of the local date; empty when the zone is unknown. */
  localIsoDate: string;
  /** Slider data; `undefined` when the zone is unknown. */
  dayTrack?: PresentedDayTrack;
};

/**
 * The one owner of UTC offset, offset difference, local time and date and day
 * track of a zone. The subject is a location or the Here entry (no ID).
 * Implements FR2, FR3 of show-here-entry-for-device-time (D2); the code moved
 * from `presentLocationRows`.
 */
export function presentZoneMoment(
  subject: { id?: string; timeZoneId: string },
  {
    language,
    instant,
    translate,
    deviceTimeZoneId,
    homeLocationId,
    referenceOffsetMinutes,
    referenceDay,
  }: LocationRowsContext,
): PresentedZoneMoment {
  const offsetMinutes = getUtcOffsetMinutes(subject.timeZoneId, instant);
  const differenceMinutes = getOffsetDifferenceMinutes(
    subject,
    offsetMinutes,
    referenceOffsetMinutes,
    { deviceTimeZoneId, homeLocationId },
  );
  const difference =
    differenceMinutes === undefined
      ? undefined
      : formatOffsetDifference(differenceMinutes, translate);
  const localDateTime = getLocalDateTime(subject.timeZoneId, instant);
  const localTimeLabel = localDateTime
    ? formatLocalTime(localDateTime, language)
    : "";
  const localDateLabel = localDateTime
    ? formatLocalDate(localDateTime, language)
    : "";
  return {
    utcOffsetLabel:
      offsetMinutes === undefined
        ? ""
        : formatUtcOffset(
            offsetMinutes,
            translate("locations.utcOffsetPrefix"),
          ),
    offsetDifferenceLabel: difference?.label ?? "",
    offsetDifferenceAccessibleLabel: difference?.accessibleLabel ?? "",
    localTimeLabel,
    localDateLabel,
    localIsoDate: localDateTime ? localDateTime.toPlainDate().toString() : "",
    dayTrack: localDateTime
      ? presentDayTrack({
          timeZoneId: subject.timeZoneId,
          instant,
          day: referenceDay,
          language,
          translate,
          localTimeLabel,
          localDateLabel,
        })
      : undefined,
  };
}
