import { HourFormat, type Preferences, ThemePreference } from "./preferences";

export type ParseStoredPreferencesResult =
  | { ok: true; preferences: Preferences }
  | { ok: false };

const THEME_VALUES: readonly unknown[] = Object.values(ThemePreference);
const HOUR_FORMAT_VALUES: readonly unknown[] = Object.values(HourFormat);

const isInterfaceLanguage = (value: unknown): value is string | null =>
  value === null || (typeof value === "string" && value !== "");

/**
 * Validates the payload of the stored preferences document; any missing or
 * unknown value rejects it as a whole.
 * Implements FR7 of add-settings-page-and-device-time-location (D5);
 * the interface language implements FR7 of add-interface-language-selection (D1).
 */
export function parseStoredPreferences(
  payload: unknown,
): ParseStoredPreferencesResult {
  if (typeof payload !== "object" || payload === null) return { ok: false };
  const { theme, hourFormat, interfaceLanguage } = payload as Record<
    string,
    unknown
  >;
  if (
    !THEME_VALUES.includes(theme) ||
    !HOUR_FORMAT_VALUES.includes(hourFormat) ||
    !isInterfaceLanguage(interfaceLanguage)
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    preferences: {
      theme: theme as ThemePreference,
      hourFormat: hourFormat as HourFormat,
      interfaceLanguage,
    },
  };
}
