import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { type PreferencesLoadResult, PreferencesLoadStatus } from "@/ports";
import { type Preferences, parseStoredPreferences } from "@/preferences";
import { migratePayload, type PayloadMigrations } from "./payloadMigrations";

/**
 * The stored preferences document: `{ schemaVersion, payload }` (ADR-0004).
 * Implements FR8 of add-interface-language-selection (D2).
 */

/**
 * Version 1 had no interface language: the step adds the one the legacy
 * `language` key held (or "not chosen"), so an existing user keeps their language.
 */
export const createPreferencesMigrations = (
  legacyInterfaceLanguage: string | null,
): PayloadMigrations => ({
  1: (payload) => ({
    ...(payload as object),
    interfaceLanguage: legacyInterfaceLanguage,
  }),
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
