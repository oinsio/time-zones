import type { TFunction } from "i18next";
import type { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  getLocalDateTime,
  getOffsetDifferenceMinutes,
  getUtcOffsetMinutes,
  type ReferenceDay,
  type WallClockNote,
  WallClockNotePlacement,
} from "@/model";
import type { HourFormat } from "@/preferences";
import { type PresentedDayTrack, presentDayTrack } from "./dayTrack";
import { formatLocalDate, formatLocalTime } from "./localDateTime";
import { formatOffsetDifference } from "./offsetDifference";
import { formatUtcOffset } from "./utcOffset";
import { presentWallTimeHint } from "./wallTimeHint";

export type LocationRowsContext = {
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
  instant: Temporal.Instant;
  translate: TFunction;
  deviceTimeZoneId: string;
  homeLocationId: string | null;
  /** Offset of the reference zone, read once per presentation (NFR-P1). */
  referenceOffsetMinutes: number | undefined;
  referenceDay: ReferenceDay;
  /** Exemplar city of the device zone; `undefined` until known (FR8 of add-settings-page-and-device-time-location). */
  deviceTimeCityLabel?: string;
  /** The one wall-clock note of the moment; absent means none. */
  wallClockNote?: WallClockNote;
};

/** What a time zone shows at the reference moment: shared by the location rows. */
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
  /** "Enter time — Moscow, 10:30": the name of the time button and its field. */
  wallTimeInputLabel: string;
  /** The wall-time hint of this row; `undefined` when the row has none. */
  wallTimeHint?: string;
};

/**
 * The one owner of UTC offset, offset difference, local time and date and day
 * track of a zone. The subject is a location.
 * Implements FR2, FR3 of show-here-entry-for-device-time (D2); the code moved
 * from `presentLocationRows`.
 * Implements FR7, NFR-A2 of add-wall-time-input-with-hint (D7): the time button name, the wall-time hint
 * and the row note.
 */
export function presentZoneMoment(
  subject: { id: string; timeZoneId: string; cityLabel: string },
  {
    language,
    hourFormat,
    instant,
    translate,
    deviceTimeZoneId,
    homeLocationId,
    referenceOffsetMinutes,
    referenceDay,
    wallClockNote,
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
    ? formatLocalTime(localDateTime, language, hourFormat)
    : "";
  const localDateLabel = localDateTime
    ? formatLocalDate(localDateTime, language)
    : "";
  const utcOffsetLabel =
    offsetMinutes === undefined
      ? ""
      : formatUtcOffset(offsetMinutes, translate("locations.utcOffsetPrefix"));
  const hintNote = findRowNoteOf(wallClockNote, subject.id);
  return {
    utcOffsetLabel,
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
          hourFormat,
          translate,
          localTimeLabel,
          localDateLabel,
        })
      : undefined,
    wallTimeInputLabel: translate("locations.wallTimeInputLabel", {
      city: subject.cityLabel,
      time: localTimeLabel,
    }),
    wallTimeHint:
      hintNote === undefined
        ? undefined
        : presentWallTimeHint({
            status: hintNote.status,
            requestedWallTime: hintNote.requestedWallTime,
            shownTimeLabel: localTimeLabel,
            utcOffsetLabel,
            language,
            hourFormat,
            translate,
          }),
  };
}

type RowNote = Extract<
  WallClockNote,
  { placement: WallClockNotePlacement.ROW }
>;

/** The note when it is a row note about this subject: a location by id. */
function findRowNoteOf(
  note: WallClockNote | undefined,
  subjectId: string | undefined,
): RowNote | undefined {
  if (note?.placement !== WallClockNotePlacement.ROW) return undefined;
  const isAboutSubject = subjectId === note.target.locationId;
  return isAboutSubject ? note : undefined;
}
