// Implements FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks (D4).
import { expect } from "vitest";
import {
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import { Temporal } from "@/lib/temporal";
import type { LocationRow } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { ENGLISH_LANGUAGE, RUSSIAN_LANGUAGE } from "./localTimeWorld";
import { presentBudgetRows } from "./rowBudgetWorld";

const LABEL_CITIES = ["Kolkata", "Kathmandu", "New York"];
const LABEL_LANGUAGES: SupportedLanguage[] = [
  ENGLISH_LANGUAGE,
  RUSSIAN_LANGUAGE,
];

/** Time and date labels of three zones with :30 and :45 offsets, as the presenter writes them. */
export const createLocalTimeLabelsCheck = () => {
  let instant = "";
  let presentedByLanguage: [SupportedLanguage, LocationRow[]][] = [];
  const locations = LABEL_CITIES.map((label) =>
    buildLocation({ label, ...KNOWN_CITIES[label] }),
  );

  return {
    presentAt: (timestamp: string) => {
      instant = timestamp;
      presentedByLanguage = LABEL_LANGUAGES.map((language) => [
        language,
        presentBudgetRows(locations, { timestamp, language }),
      ]);
    },
    expectPlatformLabels: () => {
      for (const [language, rows] of presentedByLanguage) {
        rows.forEach((row, index) => {
          const platformDateTime = Temporal.Instant.from(
            instant,
          ).toZonedDateTimeISO(locations[index].timeZoneId);
          expect(row.localTimeLabel).toBe(
            platformDateTime.toLocaleString(
              language,
              LOCAL_TIME_FORMAT_OPTIONS,
            ),
          );
          expect(row.localDateLabel).toBe(
            platformDateTime.toLocaleString(
              language,
              LOCAL_DATE_FORMAT_OPTIONS,
            ),
          );
        });
      }
    },
  };
};
