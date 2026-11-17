import type { TFunction } from "i18next";
import { CITY_DATA_DATE, UTC_ZONE_ID } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

/**
 * The city data attribution: the credit to GeoNames naming the dump date of
 * the city data. The date is a calendar date, so it is written in UTC and does
 * not shift with the device zone; the deploy date formatter is cached.
 * Implements FR12, FR13, NFR-P3 of apply-data-updates-silently (D6).
 */
export function presentCityDataAttribution(
  language: InterfaceLanguageCode,
  translate: TFunction,
): string {
  const dumpDateEpochMilliseconds = Temporal.PlainDate.from(CITY_DATA_DATE)
    .toZonedDateTime(UTC_ZONE_ID)
    .toInstant().epochMilliseconds;
  const date = getDateTimeFormatter(
    language,
    UTC_ZONE_ID,
    DateTimeLabelKind.DEPLOY_DATE,
    HourFormat.H24,
  ).format(dumpDateEpochMilliseconds);
  return translate("settings.cityDataAttribution", { date });
}
