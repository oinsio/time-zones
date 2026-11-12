import {
  ZoneRulesSourceFailure,
  type ZoneRulesVersion,
  type ZoneRulesVersionSource,
} from "@/ports";

export type InMemoryZoneRulesVersionSourceScript = {
  /** What `fetchVersion` answers. */
  version?: ZoneRulesVersion | ZoneRulesSourceFailure;
  /** What `fetchRelease` answers, by release name; a missing name fails. */
  releases?: Record<string, unknown | ZoneRulesSourceFailure>;
};

export type InMemoryZoneRulesVersionSource = ZoneRulesVersionSource & {
  /** How many times the version file was requested. */
  readonly versionRequestCount: () => number;
  /** The release names requested, in order. */
  readonly requestedReleases: () => readonly string[];
  /** Changes what the version file names, for a later check. */
  setVersion: (version: ZoneRulesVersion | ZoneRulesSourceFailure) => void;
  /** Changes a release file's answer. */
  setRelease: (name: string, answer: unknown | ZoneRulesSourceFailure) => void;
};

/**
 * In-memory `ZoneRulesVersionSource` for tests and stories: scripted answers
 * and counted requests.
 * Implements FR3, FR4 of add-remote-zone-rules-updates (design D4).
 */
export function createInMemoryZoneRulesVersionSource({
  version = ZoneRulesSourceFailure.REQUEST_FAILED,
  releases = {},
}: InMemoryZoneRulesVersionSourceScript = {}): InMemoryZoneRulesVersionSource {
  let currentVersion = version;
  const currentReleases = { ...releases };
  let versionRequests = 0;
  const requested: string[] = [];

  return {
    fetchVersion: async () => {
      versionRequests += 1;
      return currentVersion;
    },
    fetchRelease: async (name) => {
      requested.push(name);
      return name in currentReleases
        ? currentReleases[name]
        : ZoneRulesSourceFailure.REQUEST_FAILED;
    },
    versionRequestCount: () => versionRequests,
    requestedReleases: () => [...requested],
    setVersion: (nextVersion) => {
      currentVersion = nextVersion;
    },
    setRelease: (name, answer) => {
      currentReleases[name] = answer;
    },
  };
}
