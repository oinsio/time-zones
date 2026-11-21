import {
  DayColouring,
  DayPalette,
  HourFormat,
  type Preferences,
  SHARE_ZONE_LABEL_PARTS,
  ThemePreference,
  ZoneLabelPart,
} from "./preferences";
import { isWorkingHours } from "./workingHours";

export type ParseStoredPreferencesResult =
  | { ok: true; preferences: Preferences }
  | { ok: false };

const THEME_VALUES: readonly unknown[] = Object.values(ThemePreference);
const HOUR_FORMAT_VALUES: readonly unknown[] = Object.values(HourFormat);

const DAY_COLOURING_VALUES: readonly unknown[] = Object.values(DayColouring);

const DAY_PALETTE_VALUES: readonly unknown[] = Object.values(DayPalette);

const ZONE_LABEL_PART_VALUES: readonly unknown[] = Object.values(ZoneLabelPart);

const isZoneLabelParts = (value: unknown): value is ZoneLabelPart[] =>
  Array.isArray(value) &&
  value.every((part) => ZONE_LABEL_PART_VALUES.includes(part)) &&
  new Set(value).size === value.length;

const isShareZoneLabelParts = (value: unknown): value is ZoneLabelPart[] =>
  isZoneLabelParts(value) &&
  value.every((part) => SHARE_ZONE_LABEL_PARTS.includes(part));

const isNullOrNonEmptyString = (value: unknown): value is string | null =>
  value === null || (typeof value === "string" && value !== "");

/**
 * Validates the payload of the stored preferences document; any missing or
 * unknown value rejects it as a whole.
 * Implements FR7 of add-settings-page-and-device-time-location (D5);
 * the interface language implements FR7 of add-interface-language-selection (D1);
 * the zone label implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4);
 * the view mode implements FR3, FR4 of add-view-mode-setting-and-grid-skeleton (D1);
 * the day colouring and working hours implement FR3, FR7 of add-day-colouring-setting (D1, D2);
 * the day palette implements FR3 of redesign-cards-grid-and-day-palettes (D2);
 * the share choices implement FR5, FR6 of add-meeting-share-dialog (D4).
 */
export function parseStoredPreferences(
  payload: unknown,
): ParseStoredPreferencesResult {
  if (typeof payload !== "object" || payload === null) return { ok: false };
  const {
    theme,
    hourFormat,
    interfaceLanguage,
    zoneLabelParts,
    viewMode,
    dayColouring,
    workingHours,
    dayPalette,
    shareLanguage,
    shareZoneLabelParts,
  } = payload as Record<string, unknown>;
  if (
    !THEME_VALUES.includes(theme) ||
    !HOUR_FORMAT_VALUES.includes(hourFormat) ||
    !isNullOrNonEmptyString(interfaceLanguage) ||
    !isZoneLabelParts(zoneLabelParts) ||
    !isNullOrNonEmptyString(viewMode) ||
    !DAY_COLOURING_VALUES.includes(dayColouring) ||
    !isWorkingHours(workingHours) ||
    !DAY_PALETTE_VALUES.includes(dayPalette) ||
    !isNullOrNonEmptyString(shareLanguage) ||
    !isShareZoneLabelParts(shareZoneLabelParts)
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    preferences: {
      theme: theme as ThemePreference,
      hourFormat: hourFormat as HourFormat,
      interfaceLanguage,
      viewMode,
      dayColouring: dayColouring as DayColouring,
      dayPalette: dayPalette as DayPalette,
      shareLanguage,
      shareZoneLabelParts: SHARE_ZONE_LABEL_PARTS.filter((part) =>
        shareZoneLabelParts.includes(part),
      ),
      workingHours: { start: workingHours.start, end: workingHours.end },
      zoneLabelParts: Object.values(ZoneLabelPart).filter((part) =>
        zoneLabelParts.includes(part),
      ),
    },
  };
}
