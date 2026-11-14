/**
 * The city data check: `pnpm --filter @time-zones/client city-data:check`
 * validates the committed file offline against the bundled zone rules release.
 * Implements FR12, M1, M4 of add-geonames-city-source (D8).
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import { loadZoneData } from "../zoneData/loadZoneData.ts";
import { checkCityData } from "./checkCityData.ts";
import { DATASET_PATH } from "./constants.ts";
import { readReleaseZoneIds } from "./readReleaseZoneIds.ts";

export type CityDataCheckDependencies = {
  readFile: (path: string) => Promise<string>;
  log: (line: string) => void;
};

async function readDataset(
  dependencies: CityDataCheckDependencies,
): Promise<unknown> {
  const text = await dependencies.readFile(DATASET_PATH);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${DATASET_PATH} is not valid JSON`);
  }
}

/** Checks the committed file and returns the exit code. */
export async function runCityDataCheck(
  dependencies: CityDataCheckDependencies,
): Promise<number> {
  try {
    const dataset = await readDataset(dependencies);
    const releaseZones = readReleaseZoneIds(
      await dependencies.readFile(ZONE_RULES_RELEASE_FILE),
    );
    const errors = checkCityData(
      dataset,
      releaseZones,
      loadZoneData().zoneCities,
    );
    if (errors.length > 0) {
      for (const error of errors) dependencies.log(error);
      return 1;
    }
    const cityCount = (dataset as { cities: unknown[] }).cities.length;
    dependencies.log(`${DATASET_PATH} is valid: ${cityCount} cities`);
    return 0;
  } catch (error) {
    dependencies.log(
      `Checking ${DATASET_PATH} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

// Stryker disable all: the entry point binds the real dependencies; the CI step covers it
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runCityDataCheck({
    readFile: (path) => readFile(path, "utf8"),
    log: console.log,
  });
}
// Stryker restore all
