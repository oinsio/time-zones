// Implements FR6, NFR-P2 of add-remote-zone-rules-updates: shared data of the active release steps.
import { STORED_RELEASE_SCHEMA_VERSION } from "@/constants";
import { buildAlmatyReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";

export const RELEASE_URL = "/assets/zone-rules-abc.json";
export const SECONDS_PER_HOUR = 3600;
export const BUNDLED_DOCUMENT = buildAlmatyReleaseDocument(
  "2026f",
  5 * SECONDS_PER_HOUR,
);
export const NEWER_DOCUMENT = buildAlmatyReleaseDocument(
  "2026g",
  4 * SECONDS_PER_HOUR,
);
export const ALMATY_EIGHT_UTC = Date.UTC(2026, 6, 15, 8);
export const ALMATY_UTC_PLUS_FOUR_CLOCK = "12:00";

export const UNREADABLE_DOCUMENTS: Record<string, string> = {
  "not valid JSON": "not valid JSON",
  "an envelope with schema version 2": JSON.stringify({
    schemaVersion: 2,
    payload: NEWER_DOCUMENT,
  }),
  "an envelope whose payload is not a zone rules release": JSON.stringify({
    schemaVersion: STORED_RELEASE_SCHEMA_VERSION,
    payload: { release: 5 },
  }),
};

export const nativeDateTimeFormat = Intl.DateTimeFormat;

export const envelopeOf = (document: unknown) =>
  JSON.stringify({
    schemaVersion: STORED_RELEASE_SCHEMA_VERSION,
    payload: document,
  });
