import {
  HourFormat,
  type Preferences,
  ThemePreference,
  ZoneLabelPart,
} from "./preferences";

export type ParseStoredPreferencesResult =
  | { ok: true; preferences: Preferences }
  | { ok: false };

const THEME_VALUES: readonly unknown[] = Object.values(ThemePreference);
const HOUR_FORMAT_VALUES: readonly unknown[] = Object.values(HourFormat);

const ZONE_LABEL_PART_VALUES: readonly unknown[] = Object.values(ZoneLabelPart);

const isZoneLabelParts = (value: unknown): value is ZoneLabelPart[] =>
  Array.isArray(value) &&
  value.every((part) => ZONE_LABEL_PART_VALUES.includes(part)) &&
  new Set(value).size === value.length;

const isInterfaceLanguage = (value: unknown): value is string | null =>
  value === null || (typeof value === "string" && value !== "");

/**
 * Validates the payload of the stored preferences document; any missing or
 * unknown value rejects it as a whole.
 * Implements FR7 of add-settings-page-and-device-time-location (D5);
 * the interface language implements FR7 of add-interface-language-selection (D1);
 * the zone label implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4).
 */
export function parseStoredPreferences(
  payload: unknown,
): ParseStoredPreferencesResult {
  if (typeof payload !== "object" || payload === null) return { ok: false };
  const { theme, hourFormat, interfaceLanguage, zoneLabelParts } =
    payload as Record<string, unknown>;
  if (
    !THEME_VALUES.includes(theme) ||
    !HOUR_FORMAT_VALUES.includes(hourFormat) ||
    !isInterfaceLanguage(interfaceLanguage) ||
    !isZoneLabelParts(zoneLabelParts)
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    preferences: {
      theme: theme as ThemePreference,
      hourFormat: hourFormat as HourFormat,
      interfaceLanguage,
      zoneLabelParts: Object.values(ZoneLabelPart).filter((part) =>
        zoneLabelParts.includes(part),
      ),
    },
  };
}
