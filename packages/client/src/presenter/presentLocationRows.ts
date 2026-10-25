import type { TFunction } from "i18next";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
import {
  getLocalDateTime,
  getUtcOffsetMinutes,
  isLocationInDeviceTimeZone,
  type Location,
  type ReferenceDay,
} from "@/model";
import { presentCountryName } from "./countryName";
import { type PresentedDayTrack, presentDayTrack } from "./dayTrack";
import { formatLocalDate, formatLocalTime } from "./localDateTime";
import { formatUtcOffset } from "./utcOffset";

export type LocationRow = {
  id: string;
  cityLabel: string;
  countryName: string;
  /** "UTC+3" style label; empty when the offset cannot be computed. */
  utcOffsetLabel: string;
  /** "Your time zone" badge text; empty when the row is not in the device zone. */
  deviceTimeZoneLabel: string;
  /** "12:30" style label; empty when the zone is unknown. */
  localTimeLabel: string;
  /** "Sun, Mar 8" style label; empty when the zone is unknown. */
  localDateLabel: string;
  /** ISO date ("2026-03-08") of the local date; empty when the zone is unknown. */
  localIsoDate: string;
  /** Slider data; `undefined` when the zone is unknown. */
  dayTrack?: PresentedDayTrack;
};

export type LocationRowsContext = {
  language: SupportedLanguage;
  instant: Temporal.Instant;
  translate: TFunction;
  deviceTimeZoneId: string;
  referenceDay: ReferenceDay;
};

/**
 * Rows of the location list: city, country name in the interface language and
 * the UTC offset at the given instant.
 * Implements FR10, UX4 of add-locations-via-search (D9).
 * Implements FR2, FR3, FR5, FR6 of show-utc-offset-on-location-rows (D2).
 * Implements FR1, FR2, FR5 of mark-device-time-zone-in-location-list (D4).
 * Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D3).
 * Implements FR1 of add-time-sliders-to-location-cards (D5): the day track.
 */
export function presentLocationRows(
  locations: readonly Location[],
  {
    language,
    instant,
    translate,
    deviceTimeZoneId,
    referenceDay,
  }: LocationRowsContext,
): LocationRow[] {
  const utcPrefix = translate("locations.utcOffsetPrefix");
  const deviceTimeZoneBadge = translate("locations.deviceTimeZoneBadge");
  return locations.map((location) => {
    const offsetMinutes = getUtcOffsetMinutes(location.timeZoneId, instant);
    const localDateTime = getLocalDateTime(location.timeZoneId, instant);
    const localTimeLabel = localDateTime
      ? formatLocalTime(localDateTime, language)
      : "";
    const localDateLabel = localDateTime
      ? formatLocalDate(localDateTime, language)
      : "";
    return {
      id: location.id,
      cityLabel: location.label,
      countryName: presentCountryName(location.countryCode, language),
      utcOffsetLabel:
        offsetMinutes === undefined
          ? ""
          : formatUtcOffset(offsetMinutes, utcPrefix),
      deviceTimeZoneLabel: isLocationInDeviceTimeZone(
        location,
        deviceTimeZoneId,
      )
        ? deviceTimeZoneBadge
        : "",
      localTimeLabel,
      localDateLabel,
      localIsoDate: localDateTime ? localDateTime.toPlainDate().toString() : "",
      dayTrack: localDateTime
        ? presentDayTrack({
            timeZoneId: location.timeZoneId,
            instant,
            day: referenceDay,
            language,
            translate,
            localTimeLabel,
            localDateLabel,
          })
        : undefined,
    };
  });
}
