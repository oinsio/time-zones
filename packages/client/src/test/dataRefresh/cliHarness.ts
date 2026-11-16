// Shared fakes of the data refresh command line tests; implements FR3 of refresh-data-through-scheduled-pull-requests.
import type { DataRefreshDependencies } from "../../../scripts/dataRefresh/cliCommands.ts";

export const RELEASE_PATH = "zone-rules/release.json";
export const COORDINATES_PATH = "zone-rules/zone-coordinates.json";
export const CITY_PATH = "city-data/geonames-cities.json";
export const MANIFEST = "packages/client/package.json";

export type Fakes = {
  committed?: Record<string, string>;
  refreshed?: Record<string, string>;
  changedPaths?: string[];
  manifestDiff?: string;
  currentBranch?: string;
  headBranch?: string;
};

export function createHarness(fakes: Fakes = {}) {
  const outputs: Record<string, string> = {};
  const files: Record<string, string> = {};
  const lines: string[] = [];
  const dependencies: DataRefreshDependencies = {
    readCommittedFile: async (path) => fakes.committed?.[path],
    readRefreshedFile: async (path) => fakes.refreshed?.[path],
    listChangedPaths: async () => fakes.changedPaths ?? [],
    readManifestDiff: async () => fakes.manifestDiff ?? "",
    readCurrentBranch: async () => fakes.currentBranch ?? "main",
    headBranchFromEnvironment: fakes.headBranch,
    writeOutput: async (key, value) => {
      outputs[key] = value;
    },
    writeTextFile: async (fileName, content) => {
      files[fileName] = content;
      return `/tmp/${fileName}`;
    },
    log: (line) => lines.push(line),
  };
  return { dependencies, outputs, files, lines };
}

export const zoneRelease = (release: string, ids: string[]) =>
  JSON.stringify({
    release,
    zones: Object.fromEntries(ids.map((id) => [id, {}])),
  });
export const zoneCoordinates = (ids: string[]) =>
  JSON.stringify({ zones: Object.fromEntries(ids.map((id) => [id, [1, 2]])) });
export const cityData = (dumpDate: string, population = 200_000) =>
  JSON.stringify({
    formatVersion: 1,
    source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate },
    zones: ["Europe/Paris"],
    regions: [],
    cities: [[1, "Paris", 0, "FR", 0, population, 1, 2]],
    zoneCityPopulations: {},
    zoneCityRegions: {},
  });
