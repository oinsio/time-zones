// @add-remote-zone-rules-updates @FR2, NFR-P1: the served zone rules files stay out of the precache
import { describe, expect, it } from "vitest";
import { findPrecachedZoneRulesFiles } from "../../../scripts/zoneRules/precacheExclusion.ts";

const HASHED_ASSET_ENTRY = `{url:"assets/zone-rules-DxK2.json",revision:null}`;
const SERVICE_WORKER_WITHOUT_FILES = `precacheAndRoute([{url:"index.html",revision:"1"},${HASHED_ASSET_ENTRY}])`;

describe("findPrecachedZoneRulesFiles", () => {
  it("should find nothing when only the hashed asset is precached", () => {
    expect(findPrecachedZoneRulesFiles(SERVICE_WORKER_WITHOUT_FILES)).toEqual(
      [],
    );
  });

  it("should find the version file and a release file when they are precached", () => {
    const serviceWorker = `precacheAndRoute([${HASHED_ASSET_ENTRY},{url:"zone-rules/version.json",revision:"a"},{url:"zone-rules/2026f.json",revision:"b"}])`;
    expect(findPrecachedZoneRulesFiles(serviceWorker)).toEqual([
      "zone-rules/version.json",
      "zone-rules/2026f.json",
    ]);
  });

  it("should find an entry written with single quotes", () => {
    expect(
      findPrecachedZoneRulesFiles("[{url:'zone-rules/version.json'}]"),
    ).toEqual(["zone-rules/version.json"]);
  });
});
