// FR2 of add-zone-rules-from-iana: reading the release document
import { describe, expect, it } from "vitest";
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "./zoneRulesConstants.ts";
import {
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
  ZoneRulesReleaseErrorCode,
} from "./zoneRulesRelease.ts";

const NEW_YORK_DOCUMENT = {
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

function buildDocument(overrides: Record<string, unknown> = {}) {
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

function buildDocumentWithZone(zone: unknown) {
  return buildDocument({ zones: { "America/New_York": zone } });
}

describe("parseZoneRulesRelease", () => {
  it("reads the release name", () => {
    const release = parseZoneRulesRelease(buildDocument());
    expect(release).not.toBeInstanceOf(ZoneRulesReleaseError);
    expect((release as { release: string }).release).toBe("2026f");
  });

  it("reads local time types, the cutoff type and re-bases changes to epoch seconds", () => {
    const release = parseZoneRulesRelease(buildDocument());
    if (release instanceof ZoneRulesReleaseError) throw release;
    const newYork = release.zones.get("America/New_York");
    expect(newYork?.cutoffType).toEqual({
      utcOffsetSeconds: -18000,
      designation: "EST",
      isDaylightSavingTime: false,
    });
    expect(newYork?.changes).toEqual([
      {
        epochSeconds: ZONE_RULES_CUTOFF_EPOCH_SECONDS + 7974000,
        localTimeType: {
          utcOffsetSeconds: -14400,
          designation: "EDT",
          isDaylightSavingTime: true,
        },
      },
      {
        epochSeconds: ZONE_RULES_CUTOFF_EPOCH_SECONDS + 24000000,
        localTimeType: newYork?.cutoffType,
      },
    ]);
  });

  it("parses the future rule and leaves an empty one undefined", () => {
    const release = parseZoneRulesRelease(
      buildDocument({
        zones: {
          "America/New_York": NEW_YORK_DOCUMENT,
          "Etc/UTC": {
            types: [[0, "UTC", 0]],
            cutoffType: 0,
            changes: [],
            futureRule: "",
          },
        },
      }),
    );
    if (release instanceof ZoneRulesReleaseError) throw release;
    expect(
      release.zones.get("America/New_York")?.futureRule?.standard.designation,
    ).toBe("EST");
    expect(release.zones.get("Etc/UTC")?.futureRule).toBeUndefined();
  });

  it("shares the target's rules object under a link's own name", () => {
    const release = parseZoneRulesRelease(buildDocument());
    if (release instanceof ZoneRulesReleaseError) throw release;
    expect(release.zones.get("US/Eastern")).toBe(
      release.zones.get("America/New_York"),
    );
  });

  const {
    INVALID_SHAPE,
    UNKNOWN_LINK_TARGET,
    CUTOFF_MISMATCH,
    CHANGES_NOT_ASCENDING,
    TYPE_INDEX_OUT_OF_RANGE,
  } = ZoneRulesReleaseErrorCode;
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
