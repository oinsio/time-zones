import type { TFunction } from "i18next";
import type { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import type { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";
import { formatLocalTime } from "./localDateTime";

type DeployTimeContext = {
  deployInstant: Temporal.Instant;
  deviceTimeZoneId: string;
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
  translate: TFunction;
};

/**
 * The deploy time line: the build instant as a date and a time of day in the
 * device time zone, the interface language and the hour format.
 * Implements FR5 of polish-settings-and-remove-offline-update-notice (D2).
 */
export function formatDeployTime({
  deployInstant,
  deviceTimeZoneId,
  language,
  hourFormat,
  translate,
}: DeployTimeContext): string {
  const deployDateTime = deployInstant.toZonedDateTimeISO(deviceTimeZoneId);
  const date = getDateTimeFormatter(
    language,
    deviceTimeZoneId,
    DateTimeLabelKind.DEPLOY_DATE,
    hourFormat,
  ).format(deployDateTime.epochMilliseconds);
  const time = formatLocalTime(deployDateTime, language, hourFormat);
  return translate("settings.deployTime", { date, time });
}
