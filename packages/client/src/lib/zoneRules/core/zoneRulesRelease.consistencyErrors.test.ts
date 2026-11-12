// FR2 of add-zone-rules-from-iana: the reader returns a typed error for an inconsistent document
import { describe, expect, it } from "vitest";
import {
  buildDocument,
  buildDocumentWithZone,
  NEW_YORK_DOCUMENT,
} from "@/test/zoneRules/releaseDocuments";
import {
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
  ZoneRulesReleaseErrorCode,
} from "./zoneRulesRelease.ts";

describe("parseZoneRulesRelease consistency errors", () => {
  const {
    UNKNOWN_LINK_TARGET,
    CUTOFF_MISMATCH,
    CHANGES_NOT_ASCENDING,
    TYPE_INDEX_OUT_OF_RANGE,
  } = ZoneRulesReleaseErrorCode;
  const withNewYork = (overrides: Record<string, unknown>) =>
    buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, ...overrides });

  it.each([
    [
      "a cutoff of another instant",
      buildDocument({ cutoff: 1 }),
      CUTOFF_MISMATCH,
      "cutoff",
    ],
    [
      "a link to a missing zone",
      buildDocument({ zones: { "US/Eastern": "America/New_York" } }),
      UNKNOWN_LINK_TARGET,
      "US/Eastern links to America/New_York",
    ],
    [
      "a link to a link",
      buildDocument({
        zones: {
          "America/New_York": NEW_YORK_DOCUMENT,
          A: "B",
          B: "America/New_York",
        },
      }),
      UNKNOWN_LINK_TARGET,
      "A links to B",
    ],
    [
      "a link to a link listed the other way round",
      buildDocument({
        zones: {
          "America/New_York": NEW_YORK_DOCUMENT,
          B: "America/New_York",
          A: "B",
        },
      }),
      UNKNOWN_LINK_TARGET,
      "A links to B",
    ],
    [
      "changes that do not ascend",
      withNewYork({
        changes: [
          [20, 1],
          [10, 0],
        ],
      }),
      CHANGES_NOT_ASCENDING,
      "do not ascend",
    ],
    [
      "changes at the same second",
      withNewYork({
        changes: [
          [20, 1],
          [20, 0],
        ],
      }),
      CHANGES_NOT_ASCENDING,
      "do not ascend",
    ],
    [
      "a change at the cutoff",
      withNewYork({ changes: [[0, 1]] }),
      CHANGES_NOT_ASCENDING,
      "do not ascend",
    ],
    [
      "a cutoff type index out of range",
      withNewYork({ cutoffType: 2 }),
      TYPE_INDEX_OUT_OF_RANGE,
      "out of range",
    ],
    [
      "a negative cutoff type index",
      withNewYork({ cutoffType: -1 }),
      TYPE_INDEX_OUT_OF_RANGE,
      "out of range",
    ],
    [
      "a cutoff type index that is text",
      withNewYork({ cutoffType: "0" }),
      TYPE_INDEX_OUT_OF_RANGE,
      "out of range",
    ],
    [
      "a change type index out of range",
      withNewYork({ changes: [[10, 2]] }),
      TYPE_INDEX_OUT_OF_RANGE,
      "out of range",
    ],
  ])(
    "returns a typed error for %s",
    (_description, document, code, messagePart) => {
      const release = parseZoneRulesRelease(document);
      expect(release).toBeInstanceOf(ZoneRulesReleaseError);
      expect((release as ZoneRulesReleaseError).code).toBe(code);
      expect((release as ZoneRulesReleaseError).message).toContain(messagePart);
    },
  );
});
