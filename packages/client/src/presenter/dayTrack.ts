import type { TFunction } from "i18next";
import { HOUR_LABEL_INTERVAL_HOURS } from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
import {
  type DayPeriodStop,
  getDayPeriodStops,
  getTrackEndMinutes,
  getTrackFraction,
  getTrackValueMinutes,
  type ReferenceDay,
} from "@/model";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

/**
 * Track data of one location row: handle position, slider values, colour
 * stops and local hour labels.
 * Implements FR2, FR7, FR9, NFR-A3 of add-time-sliders-to-location-cards (D5).
 */

export type HourLabel = { fraction: number; label: string };

export type PresentedDayTrack = {
  fraction: number;
  /** `aria-valuenow`: minutes since the start of the reference day. */
  valueMinutes: number;
  /** `aria-valuemax`: the track end, the last minute of the reference day (FR3 of fix-day-track-handle-overlap-and-end-of-day). */
  maxMinutes: number;
  /** `aria-valuetext`: local time and date of the card. */
  valueText: string;
  stops: readonly DayPeriodStop[];
  hourLabels: readonly HourLabel[];
};

export type DayTrackContext = {
  timeZoneId: string;
  instant: Temporal.Instant;
  day: ReferenceDay;
  language: SupportedLanguage;
  translate: TFunction;
  localTimeLabel: string;
  localDateLabel: string;
};

const LABEL_COUNT = 4;

/** Two-digit hours, with minutes when they are not zero. */
export function formatHourLabel(
  localDateTime: Temporal.ZonedDateTime,
  language: SupportedLanguage,
): string {
  const kind =
    localDateTime.minute === 0
      ? DateTimeLabelKind.HOUR
      : DateTimeLabelKind.LOCAL_TIME;
  return getDateTimeFormatter(language, localDateTime.timeZoneId, kind).format(
    localDateTime.epochMilliseconds,
  );
}

let cachedLabelsKey: string | undefined;
let cachedLabelsByZone = new Map<string, readonly HourLabel[]>();

function getHourLabels(
  timeZoneId: string,
  day: ReferenceDay,
  language: SupportedLanguage,
): readonly HourLabel[] {
  const labelsKey = `${day.start.toString()}|${day.end.toString()}|${language}`;
  if (labelsKey !== cachedLabelsKey) {
    cachedLabelsKey = labelsKey;
    cachedLabelsByZone = new Map();
  }
  const cached = cachedLabelsByZone.get(timeZoneId);
  if (cached !== undefined) return cached;
  const instants = [
    ...Array.from({ length: LABEL_COUNT }, (_, index) =>
      day.start.add({ hours: index * HOUR_LABEL_INTERVAL_HOURS }),
    ),
    day.end,
  ];
  const labels = instants.map((labelInstant) => ({
    fraction: getTrackFraction(day, labelInstant),
    label: formatHourLabel(
      labelInstant.toZonedDateTimeISO(timeZoneId),
      language,
    ),
  }));
  cachedLabelsByZone.set(timeZoneId, labels);
  return labels;
}

export function presentDayTrack({
  timeZoneId,
  instant,
  day,
  language,
  translate,
  localTimeLabel,
  localDateLabel,
}: DayTrackContext): PresentedDayTrack {
  return {
    fraction: getTrackFraction(day, instant),
    valueMinutes: getTrackValueMinutes(day, instant),
    maxMinutes: getTrackEndMinutes(day),
    valueText: translate("locations.timeSliderValue", {
      time: localTimeLabel,
      date: localDateLabel,
    }),
    stops: getDayPeriodStops(timeZoneId, day),
    hourLabels: getHourLabels(timeZoneId, day, language),
  };
}
