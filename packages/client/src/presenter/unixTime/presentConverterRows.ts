import type { TFunction } from "i18next";
import {
  MAX_FORMATTABLE_EPOCH_MILLISECONDS,
  NANOSECONDS_PER_MILLISECOND,
  UTC_ZONE_ID,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  buildDeviceTimeLocation,
  getLocalDateTime,
  getLocationMarkKind,
  getUtcOffsetMinutes,
  getZoneAbbreviation,
  isDeviceTimeLocation,
  type Location,
} from "@/model";
import {
  type ConverterState,
  toInstant,
  UNIX_TIME_UNIT_FRACTION_DIGITS,
} from "@/model/unixTime";
import { type HourFormat, ZoneLabelPart } from "@/preferences";
import { presentCountryName } from "../countryName";
import { formatLocalDate } from "../localDateTime";
import {
  type PresentedLocationMark,
  presentLocationMarks,
} from "../locationMark";
import { formatUtcOffset } from "../utcOffset";
import { presentWallTimeHint } from "../wallTimeHint";
import { formatZoneAbbreviation } from "../zoneAbbreviation";
import { presentZoneLine, type ZoneLinePart } from "../zoneLine";
import { formatExactLocalTime } from "./exactTimeLabel";

export type ConverterRowsContext = {
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
  zoneLabelParts: readonly ZoneLabelPart[];
  translate: TFunction;
  deviceTimeZoneId: string;
  homeLocationId: string | null;
  /** Exemplar city of the device zone; `undefined` until known. */
  deviceTimeCityLabel?: string;
  /** City label per location id in the interface language; absent until the city data is loaded. */
  cityLabels?: ReadonlyMap<string, string>;
};

/** One row of the converter: a location at the converter moment. */
export type PresentedConverterRow = {
  id: string;
  /** The zone the row's commands carry. */
  timeZoneId: string;
  cityLabel: string;
  mark?: PresentedLocationMark;
  zoneLineParts: readonly ZoneLinePart[];
  /** "пн, 23 нояб." style label. */
  dateLabel: string;
  /** ISO date of the row's local date, for the calendar. */
  localIsoDate: string;
  /** "14:23:07.123" style label with the fraction digits of the precision. */
  timeLabel: string;
  /** The name of the time field and of the date button. */
  timeInputLabel: string;
  dateButtonLabel: string;
  /** The hint of a time that fell in a DST gap or overlap; `undefined` for none. */
  wallTimeHint?: string;
};

/**
 * Whether the local clock reading of a row is inside what `Intl` formats: at
 * the very end of the range of a Unix time, a zone ahead of UTC reads past it.
 * Implements FR15 of add-unix-time-converter-tool (D4).
 */
function isLocalTimeFormattable(
  localDateTime: Temporal.ZonedDateTime,
): boolean {
  const localClockMilliseconds =
    localDateTime.epochMilliseconds +
    localDateTime.offsetNanoseconds / NANOSECONDS_PER_MILLISECOND;
  return Math.abs(localClockMilliseconds) <= MAX_FORMATTABLE_EPOCH_MILLISECONDS;
}

/**
 * One row per location of the list, in list order; an empty list gives one row
 * for the device time zone. Built on the row presenters of the main page, and
 * not on `presentZoneMoment`, which also builds the day track and the notes of
 * the reference day. Every formatter comes from the cache of
 * `getDateTimeFormatter`, so a second tick builds none.
 * Implements FR9, FR10, FR18, NFR-P2, UX1 of add-unix-time-converter-tool (D7).
 */
export function presentConverterRows(
  locations: readonly Location[],
  state: ConverterState,
  context: ConverterRowsContext,
): PresentedConverterRow[] {
  const { language, hourFormat, translate, deviceTimeZoneId } = context;
  const rowLocations =
    locations.length === 0
      ? [buildDeviceTimeLocation(deviceTimeZoneId)]
      : locations;
  const marks = presentLocationMarks(translate);
  const instant = toInstant(state.moment);
  const fractionDigitCount = UNIX_TIME_UNIT_FRACTION_DIGITS[state.precision];
  return rowLocations.flatMap((location) => {
    const localDateTime = getLocalDateTime(location.timeZoneId, instant);
    if (localDateTime === undefined || !isLocalTimeFormattable(localDateTime))
      return [];
    const isDeviceTime = isDeviceTimeLocation(location);
    const isUniversalTime =
      !isDeviceTime &&
      location.timeZoneId === UTC_ZONE_ID &&
      !location.countryCode;
    const cityLabel = isDeviceTime
      ? (context.deviceTimeCityLabel ?? location.timeZoneId)
      : (context.cityLabels?.get(location.id) ?? location.label);
    const markKind = getLocationMarkKind(
      location,
      deviceTimeZoneId,
      context.homeLocationId,
    );
    const offsetMinutes = getUtcOffsetMinutes(location.timeZoneId, instant);
    const utcOffsetLabel =
      offsetMinutes === undefined
        ? ""
        : formatUtcOffset(
            offsetMinutes,
            translate("locations.utcOffsetPrefix"),
          );
    const abbreviation = getZoneAbbreviation(
      location.timeZoneId,
      localDateTime,
    );
    const zoneAbbreviationLabel = abbreviation
      ? formatZoneAbbreviation(abbreviation, translate)
      : "";
    const timeLabel = formatExactLocalTime(
      localDateTime,
      state.moment.nanoseconds,
      fractionDigitCount,
      language,
      hourFormat,
    );
    const dateLabel = formatLocalDate(localDateTime, language);
    const note =
      state.rowNote?.locationId === location.id ? state.rowNote : undefined;
    return [
      {
        id: location.id,
        timeZoneId: location.timeZoneId,
        cityLabel,
        mark: markKind === undefined ? undefined : marks[markKind],
        zoneLineParts: presentZoneLine({
          placeText: isDeviceTime
            ? translate("locations.deviceTimeMeta")
            : isUniversalTime
              ? translate("locations.universalTime")
              : presentCountryName(location.countryCode, language),
          zoneAbbreviationLabel,
          utcOffsetLabel,
          zoneLabelParts: context.zoneLabelParts,
          isDeviceTimeMeta: isDeviceTime,
        }),
        dateLabel,
        localIsoDate: localDateTime.toPlainDate().toString(),
        timeLabel,
        timeInputLabel: translate("unixTime.rowTimeLabel", {
          city: cityLabel,
          time: timeLabel,
        }),
        dateButtonLabel: translate("unixTime.rowDateLabel", {
          city: cityLabel,
          date: dateLabel,
        }),
        wallTimeHint:
          note === undefined
            ? undefined
            : presentWallTimeHint({
                status: note.status,
                requestedWallTime: Temporal.PlainTime.from(
                  note.requestedWallTime,
                ),
                shownTimeLabel: timeLabel,
                utcOffsetLabel,
                zoneAbbreviationLabel,
                isZoneAbbreviationShown: context.zoneLabelParts.includes(
                  ZoneLabelPart.ZONE_ABBREVIATION,
                ),
                language,
                hourFormat,
                translate,
              }),
      },
    ];
  });
}
