import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { type PreferencesLoadResult, PreferencesLoadStatus } from "@/ports";
import {
  DayColouring,
  DayPalette,
  DEFAULT_WORKING_HOURS,
  type Preferences,
  parseStoredPreferences,
  SHARE_ZONE_LABEL_PARTS,
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
 * Version 5 had no day colouring: step 5 adds Time of day and the default
 * working hours. Implements FR2, FR7 of add-day-colouring-setting (D2).
 * Version 6 had no day palette: step 6 adds Vivid.
 * Implements FR3 of redesign-cards-grid-and-day-palettes (D2).
 * Version 7 had no share choices: step 7 pins no share language and shows both
 * share zone label parts. Implements FR5, FR6 of add-meeting-share-dialog (D4).
 * Version 8 had no enabled tools: step 8 turns none on.
 * Implements FR3 of add-unix-time-converter-tool (D1).
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
  5: (payload) => ({
    ...(payload as object),
    dayColouring: DayColouring.TIME_OF_DAY,
    workingHours: DEFAULT_WORKING_HOURS,
  }),
  6: (payload) => ({ ...(payload as object), dayPalette: DayPalette.VIVID }),
  7: (payload) => ({
    ...(payload as object),
    shareLanguage: null,
    shareZoneLabelParts: SHARE_ZONE_LABEL_PARTS,
  }),
  8: (payload) => ({ ...(payload as object), enabledTools: [] }),
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
      dayColouring: preferences.dayColouring,
      workingHours: preferences.workingHours,
      dayPalette: preferences.dayPalette,
      shareLanguage: preferences.shareLanguage,
      shareZoneLabelParts: preferences.shareZoneLabelParts,
      enabledTools: preferences.enabledTools,
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
