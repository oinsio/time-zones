// Verifies FR4, FR9 of add-remote-zone-rules-updates: a failed check is silent and changes nothing.
import { afterEach, describe, expect, it } from "vitest";
import { ZoneRulesSourceFailure } from "@/ports";
import { resetPageVisibility } from "@/test/pageVisibility";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import {
  createZoneRulesUpdateWorld,
  publishing,
  SIXTEEN_MINUTES_LATER,
  type ZoneRulesUpdateWorldOptions,
} from "@/test/zoneRules/zoneRulesUpdateWorld";

afterEach(resetPageVisibility);

const FAILURES: ReadonlyArray<[string, ZoneRulesUpdateWorldOptions]> = [
  [
    "the version file request fails",
    { script: { version: ZoneRulesSourceFailure.REQUEST_FAILED } },
  ],
  [
    "the version file is not JSON",
    { script: { version: ZoneRulesSourceFailure.UNPARSABLE } },
  ],
  [
    "the version file names an invalid release",
    { script: { version: { release: "latest" } } },
  ],
  [
    "the release file request fails",
    {
      script: {
        version: { release: "2026g" },
        releases: { "2026g": ZoneRulesSourceFailure.REQUEST_FAILED },
      },
    },
  ],
  [
    "the release file is not a valid release",
    {
      script: {
        version: { release: "2026g" },
        releases: { "2026g": { release: "2026g" } },
      },
    },
  ],
  [
    "the release file names another release",
    {
      script: {
        version: { release: "2026g" },
        releases: { "2026g": buildReleaseDocument("2026h") },
      },
    },
  ],
];

describe("useZoneRulesUpdate failures", () => {
  it.each(FAILURES)(
    "should show nothing and write nothing when %s",
    async (_name, options) => {
      const world = createZoneRulesUpdateWorld(options);
      await world.settle();
      expect(world.result.current.readyRelease).toBeUndefined();
      expect(world.save).not.toHaveBeenCalled();
    },
  );

  it("should not show the notice when the save fails", async () => {
    const world = createZoneRulesUpdateWorld({
      script: publishing("2026g"),
      isStorageWritable: false,
    });
    await world.settle();
    expect(world.result.current.readyRelease).toBeUndefined();
  });

  it("should request only the version file again after a failed save", async () => {
    const world = createZoneRulesUpdateWorld({
      script: publishing("2026g"),
      isStorageWritable: false,
    });
    await world.settle();
    await world.returnToPage(SIXTEEN_MINUTES_LATER);
    expect(world.versionSource.versionRequestCount()).toBe(2);
    expect(world.versionSource.requestedReleases()).toEqual(["2026g"]);
    expect(world.save).toHaveBeenCalledTimes(1);
  });

  it("should check again by the same rule after a failure", async () => {
    const world = createZoneRulesUpdateWorld({
      script: { version: ZoneRulesSourceFailure.REQUEST_FAILED },
    });
    await world.settle();
    world.versionSource.setVersion({ release: "2026g" });
    world.versionSource.setRelease("2026g", buildReleaseDocument("2026g"));
    await world.returnToPage(SIXTEEN_MINUTES_LATER);
    expect(world.result.current.readyRelease).toBe("2026g");
  });
});
