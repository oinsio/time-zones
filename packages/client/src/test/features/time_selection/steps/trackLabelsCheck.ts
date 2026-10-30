import { HourFormat } from "@/preferences";
// Implements FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks (D4).
import i18n from "i18next";
import { expect } from "vitest";
import {
  HOUR_LABEL_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import { Temporal } from "@/lib/temporal";
import { type HourLabel, presentLocationRows } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";

const LABEL_CITIES = ["Kolkata", "Kathmandu", "New York"];
const LABEL_LANGUAGES: SupportedLanguage[] = ["en", "ru"];
const LABEL_DEVICE_TIME_ZONE = "UTC";

/** Hour labels of three zones with :30 and :45 offsets, as the presenter writes them. */
export const createTrackLabelsCheck = () => {
  let dayStart = "";
  let presentedByLanguage: [SupportedLanguage, (readonly HourLabel[])[]][] = [];
  const locations = LABEL_CITIES.map((label) =>
    buildLocation({ label, ...KNOWN_CITIES[label] }),
  );

  const presentLabels = (language: SupportedLanguage) => {
    const instant = Temporal.Instant.from(dayStart);
    return presentLocationRows(locations, {
      language,
      hourFormat: HourFormat.H24,
      instant,
      translate: i18n.getFixedT(language),
      deviceTimeZoneId: LABEL_DEVICE_TIME_ZONE,
      homeLocationId: null,
      referenceOffsetMinutes: undefined,
      referenceDay: buildReferenceDay(instant, LABEL_DEVICE_TIME_ZONE),
    }).map((row) => row.dayTrack?.hourLabels ?? []);
  };

  /** The platform's own formatting of the instant at a label's fraction of the day. */
  const platformLabel = (
    language: SupportedLanguage,
    timeZoneId: string,
    fraction: number,
  ) => {
    const instant = Temporal.Instant.from(dayStart);
    const day = buildReferenceDay(instant, LABEL_DEVICE_TIME_ZONE);
    const dayMilliseconds =
      day.end.epochMilliseconds - day.start.epochMilliseconds;
    const labelDateTime = day.start
      .add({ milliseconds: fraction * dayMilliseconds })
      .toZonedDateTimeISO(timeZoneId);
    return labelDateTime.toLocaleString(
      language,
      labelDateTime.minute === 0
        ? HOUR_LABEL_FORMAT_OPTIONS
        : LOCAL_TIME_FORMAT_OPTIONS,
    );
  };

  return {
    presentDay: (timestamp: string) => {
      dayStart = timestamp;
      presentedByLanguage = LABEL_LANGUAGES.map((language) => [
        language,
        presentLabels(language),
      ]);
    },
    expectPlatformLabels: () => {
      for (const [language, presentedLabels] of presentedByLanguage) {
        presentedLabels.forEach((hourLabels, index) => {
          expect(hourLabels).not.toHaveLength(0);
          for (const { fraction, label } of hourLabels) {
            expect(label).toBe(
              platformLabel(language, locations[index].timeZoneId, fraction),
            );
          }
        });
      }
    },
  };
};
