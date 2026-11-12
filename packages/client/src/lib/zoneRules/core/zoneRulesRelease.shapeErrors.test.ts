// FR2 of add-zone-rules-from-iana: the reader returns a typed error for a malformed document shape
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

describe("parseZoneRulesRelease shape errors", () => {
  const { INVALID_SHAPE } = ZoneRulesReleaseErrorCode;
  const withNewYork = (overrides: Record<string, unknown>) =>
    buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, ...overrides });

  it.each([
    ["a document that is not an object", "text", INVALID_SHAPE, "the document"],
    ["a null document", null, INVALID_SHAPE, "the document"],
    ["an array document", [], INVALID_SHAPE, "the document"],
    [
      "a missing release name",
      buildDocument({ release: undefined }),
      INVALID_SHAPE,
      "the document",
    ],
    [
      "a cutoff that is not a number",
      buildDocument({ cutoff: "946684800" }),
      INVALID_SHAPE,
      "the document",
    ],
    [
      "a missing zones object",
      buildDocument({ zones: undefined }),
      INVALID_SHAPE,
      "the document",
    ],
    [
      "a zones array",
      buildDocument({ zones: [] }),
      INVALID_SHAPE,
      "the document",
    ],
    [
      "a null zones object",
      buildDocument({ zones: null }),
      INVALID_SHAPE,
      "the document",
    ],
    [
      "a zone that is a number",
      buildDocumentWithZone(7),
      INVALID_SHAPE,
      "the entry of America/New_York",
    ],
    [
      "a zone that is null",
      buildDocumentWithZone(null),
      INVALID_SHAPE,
      "the entry of America/New_York",
    ],
    [
      "a zone that is an array",
      buildDocumentWithZone([]),
      INVALID_SHAPE,
      "the entry of America/New_York",
    ],
    [
      "types that are not an array",
      withNewYork({ types: "EST" }),
      INVALID_SHAPE,
      "the types of America/New_York",
    ],
    [
      "a type that is not an array",
      withNewYork({ types: ["EST"] }),
      INVALID_SHAPE,
      "a local time type of America/New_York",
    ],
    [
      "a type that is not a triple",
      withNewYork({ types: [[0, "UTC"]] }),
      INVALID_SHAPE,
      "a local time type of America/New_York",
    ],
    [
      "a type with a text offset",
      withNewYork({ types: [["0", "UTC", 0]] }),
      INVALID_SHAPE,
      "a local time type of America/New_York",
    ],
    [
      "a type with a numeric designation",
      withNewYork({ types: [[0, 5, 0]] }),
      INVALID_SHAPE,
      "a local time type of America/New_York",
    ],
    [
      "changes that are not an array",
      withNewYork({ changes: "none" }),
      INVALID_SHAPE,
      "the changes of America/New_York",
    ],
    [
      "a change that is a number",
      withNewYork({ changes: [7] }),
      INVALID_SHAPE,
      "a clock change of America/New_York",
    ],
    [
      "a change that is not a pair",
      withNewYork({ changes: [[10, 1, 1]] }),
      INVALID_SHAPE,
      "a clock change of America/New_York",
    ],
    [
      "a change with a text time",
      withNewYork({ changes: [["10", 1]] }),
      INVALID_SHAPE,
      "a clock change of America/New_York",
    ],
    [
      "a change with a text type index",
      withNewYork({ changes: [[10, "1"]] }),
      INVALID_SHAPE,
      "a clock change of America/New_York",
    ],
    [
      "a future rule that is not text",
      withNewYork({ futureRule: 5 }),
      INVALID_SHAPE,
      "the future rule of America/New_York",
    ],
    [
      "a future rule that does not parse",
      withNewYork({ futureRule: "??" }),
      INVALID_SHAPE,
      "the future rule of America/New_York",
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
