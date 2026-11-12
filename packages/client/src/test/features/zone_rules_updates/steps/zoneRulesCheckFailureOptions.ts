// Implements FR3, FR4 of add-remote-zone-rules-updates: scripted failures of the check.
import { ZoneRulesSourceFailure } from "@/ports";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import type { ZoneRulesUpdateWorldOptions } from "@/test/zoneRules/zoneRulesUpdateWorld";

export const FAILURE_OPTIONS: Record<string, ZoneRulesUpdateWorldOptions> = {
  "the version file request fails": {
    script: { version: ZoneRulesSourceFailure.REQUEST_FAILED },
  },
  "the version file returns status 404": {
    script: { version: ZoneRulesSourceFailure.REQUEST_FAILED },
  },
  "the version file is not JSON": {
    script: { version: ZoneRulesSourceFailure.UNPARSABLE },
  },
  'the version file names the invalid release name "latest"': {
    script: { version: { release: "latest" } },
  },
  'the release file of "2026g" is not a valid zone rules release': {
    script: {
      version: { release: "2026g" },
      releases: { "2026g": { release: "2026g" } },
    },
  },
  'the release file of "2026g" names the release "2026h"': {
    script: {
      version: { release: "2026g" },
      releases: { "2026g": buildReleaseDocument("2026h") },
    },
  },
};
