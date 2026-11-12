import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { type PreferencesLoadResult, PreferencesLoadStatus } from "@/ports";
import {
  type Preferences,
  parseStoredPreferences,
  ZoneLabelPart,
} from "@/preferences";
import { migratePayload, type PayloadMigrations } from "./payloadMigrations";

/**
 * Version 1 had no interface language: the step adds the one the legacy
 * `language` key held (or "not chosen"), so an existing user keeps their language.
 * The stored preferences document is `{ schemaVersion, payload }` (ADR-0004).
 * Version 2 had no zone label: the step shows every part.
 * Version 4 had no country: step 4 adds it to a stored list that lacks it.
 * Implements FR8 of add-interface-language-selection (D2);
 * the zone label step implements FR13, FR15 of show-zone-abbreviations-and-zone-label-setting (D4).
 * Version 3 had no view mode: the step leaves none chosen (Cards).
 * Implements FR3, FR4 of add-view-mode-setting-and-grid-skeleton (D1).
 * The country step implements FR6 of add-country-to-zone-label (D2).
 */
export const createPreferencesMigrations = (
  legacyInterfaceLanguage: string | null,
): PayloadMigrations => ({
  1: (payload) => ({
    ...(payload as object),
    interfaceLanguage: legacyInterfaceLanguage,
  }),
  2: (payload) => ({
    ...(payload as object),
    zoneLabelParts: Object.values(ZoneLabelPart),
  }),
  3: (payload) => ({ ...(payload as object), viewMode: null }),
  4: (payload) => {
    const { zoneLabelParts } = payload as { zoneLabelParts?: unknown };
    return Array.isArray(zoneLabelParts) &&
      !zoneLabelParts.includes(ZoneLabelPart.COUNTRY)
      ? {
          ...(payload as object),
          zoneLabelParts: [...zoneLabelParts, ZoneLabelPart.COUNTRY],
        }
      : payload;
  },
});

export const serializePreferencesDocument = (
  preferences: Preferences,
): string =>
  JSON.stringify({
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    payload: {
      theme: preferences.theme,
      hourFormat: preferences.hourFormat,
      interfaceLanguage: preferences.interfaceLanguage,
      zoneLabelParts: preferences.zoneLabelParts,
      viewMode: preferences.viewMode,
    },
  });

const UNREADABLE: PreferencesLoadResult = {
  status: PreferencesLoadStatus.UNREADABLE,
};

/** Any document that cannot be read as a valid one is `UNREADABLE`. */
export function deserializePreferencesDocument(
  rawDocument: string | null,
  legacyInterfaceLanguage: string | null,
): PreferencesLoadResult {
  if (rawDocument === null) return { status: PreferencesLoadStatus.EMPTY };
  try {
    const { schemaVersion, payload } = JSON.parse(rawDocument);
    if (
      !Number.isInteger(schemaVersion) ||
      schemaVersion > PREFERENCES_SCHEMA_VERSION
    ) {
      return UNREADABLE;
    }
    const parsed = parseStoredPreferences(
      migratePayload(
        schemaVersion,
        payload,
        PREFERENCES_SCHEMA_VERSION,
        createPreferencesMigrations(legacyInterfaceLanguage),
      ),
    );
    return parsed.ok
      ? {
          status: PreferencesLoadStatus.LOADED,
          preferences: parsed.preferences,
        }
      : UNREADABLE;
  } catch {
    return UNREADABLE;
  }
}
