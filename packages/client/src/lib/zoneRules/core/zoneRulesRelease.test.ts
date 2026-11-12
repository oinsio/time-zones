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

  it.each([
    [
      "a document that is not an object",
      "text",
      ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    ],
    [
      "a missing release name",
      buildDocument({ release: undefined }),
      ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    ],
    [
      "a missing zones object",
      buildDocument({ zones: undefined }),
      ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    ],
    [
      "a zone that is a number",
      buildDocumentWithZone(7),
      ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    ],
    [
      "a type that is not a triple",
      buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, types: [[0, "UTC"]] }),
      ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    ],
    [
      "a future rule that does not parse",
      buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, futureRule: "??" }),
      ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    ],
    [
      "a cutoff of another instant",
      buildDocument({ cutoff: 1 }),
      ZoneRulesReleaseErrorCode.CUTOFF_MISMATCH,
    ],
    [
      "a link to a missing zone",
      buildDocument({ zones: { "US/Eastern": "America/New_York" } }),
      ZoneRulesReleaseErrorCode.UNKNOWN_LINK_TARGET,
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
      ZoneRulesReleaseErrorCode.UNKNOWN_LINK_TARGET,
    ],
    [
      "changes that do not ascend",
      buildDocumentWithZone({
        ...NEW_YORK_DOCUMENT,
        changes: [
          [20, 1],
          [10, 0],
        ],
      }),
      ZoneRulesReleaseErrorCode.CHANGES_NOT_ASCENDING,
    ],
    [
      "changes at the same second",
      buildDocumentWithZone({
        ...NEW_YORK_DOCUMENT,
        changes: [
          [20, 1],
          [20, 0],
        ],
      }),
      ZoneRulesReleaseErrorCode.CHANGES_NOT_ASCENDING,
    ],
    [
      "a change at the cutoff",
      buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, changes: [[0, 1]] }),
      ZoneRulesReleaseErrorCode.CHANGES_NOT_ASCENDING,
    ],
    [
      "a cutoff type index out of range",
      buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, cutoffType: 2 }),
      ZoneRulesReleaseErrorCode.TYPE_INDEX_OUT_OF_RANGE,
    ],
    [
      "a negative cutoff type index",
      buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, cutoffType: -1 }),
      ZoneRulesReleaseErrorCode.TYPE_INDEX_OUT_OF_RANGE,
    ],
    [
      "a change type index out of range",
      buildDocumentWithZone({ ...NEW_YORK_DOCUMENT, changes: [[10, 2]] }),
      ZoneRulesReleaseErrorCode.TYPE_INDEX_OUT_OF_RANGE,
    ],
  ])("returns a typed error for %s", (_description, document, code) => {
    const release = parseZoneRulesRelease(document);
    expect(release).toBeInstanceOf(ZoneRulesReleaseError);
    expect((release as ZoneRulesReleaseError).code).toBe(code);
  });
});
