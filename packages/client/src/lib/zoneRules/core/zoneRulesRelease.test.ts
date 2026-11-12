// FR2 of add-zone-rules-from-iana: reading the release document
import { describe, expect, it } from "vitest";
import {
  buildDocument,
  NEW_YORK_DOCUMENT,
} from "@/test/zoneRules/releaseDocuments";
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "./zoneRulesConstants.ts";
import {
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
} from "./zoneRulesRelease.ts";

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
});
