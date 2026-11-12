/**
 * Release documents for the tests of the release reader.
 * Implements FR2 of add-zone-rules-from-iana.
 */
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "@/lib/zoneRules/core";

export const NEW_YORK_DOCUMENT = {
  types: [
    [-18000, "EST", 0],
    [-14400, "EDT", 1],
  ],
  cutoffType: 0,
  changes: [
    [7974000, 1],
    [24000000, 0],
  ],
  futureRule: "EST5EDT,M3.2.0,M11.1.0",
};

export function buildDocument(overrides: Record<string, unknown> = {}) {
  return {
    release: "2026f",
    cutoff: ZONE_RULES_CUTOFF_EPOCH_SECONDS,
    zones: {
      "America/New_York": NEW_YORK_DOCUMENT,
      "US/Eastern": "America/New_York",
    },
    ...overrides,
  };
}

export function buildDocumentWithZone(zone: unknown) {
  return buildDocument({ zones: { "America/New_York": zone } });
}
