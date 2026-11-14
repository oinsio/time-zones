/**
 * The city data compiler: `pnpm --filter @time-zones/client city-data:compile`
 * downloads the GeoNames dumps, compiles the city data and writes the committed
 * file. Nothing is written when any step fails.
 * Implements FR1, FR11, FR12 of add-geonames-city-source (D8).
 */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import { loadZoneData } from "../zoneData/loadZoneData.ts";
import { fetchBytes } from "../zoneRules/downloadRelease.ts";
import type { FetchRelease, RunProcess } from "../zoneRules/processTypes.ts";
import { runChildProcess } from "../zoneRules/runChildProcess.ts";
import {
  collectWantedIds,
  compileCityData,
  selectLargeCities,
} from "./compileCityData.ts";
import { DATASET_PATH, WORK_DIRECTORY_PREFIX } from "./constants.ts";
import { downloadDumps, readSelectedAlternateNames } from "./download.ts";
import { parseAdmin1Row, parseCityRow } from "./parseGeoNamesRows.ts";
import { readReleaseZoneIds } from "./readReleaseZoneIds.ts";
import { serializeCityDataset } from "./serializeCityDataset.ts";

const LINE_SEPARATOR = "\n";

export type CityDataCompileDependencies = {
  runProcess: RunProcess;
  fetchDump: FetchRelease;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, text: string) => Promise<void>;
  log: (line: string) => void;
};

function parseLines<Row>(
  text: string,
  parseLine: (line: string, lineNumber: number) => Row,
): Row[] {
  return text
    .split(LINE_SEPARATOR)
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => line.trim() !== "")
    .map(({ line, lineNumber }) => parseLine(line, lineNumber));
}

/** Runs the whole flow and returns the exit code; writes the dataset only on success. */
export async function runCityDataCompile(
  dependencies: CityDataCompileDependencies,
): Promise<number> {
  const workDirectory = await mkdtemp(join(tmpdir(), WORK_DIRECTORY_PREFIX));
  try {
    const paths = await downloadDumps(
      dependencies.fetchDump,
      dependencies.runProcess,
      workDirectory,
    );
    const cityRows = parseLines(
      await dependencies.readFile(paths.citiesPath),
      parseCityRow,
    );
    const admin1Rows = parseLines(
      await dependencies.readFile(paths.admin1Path),
      parseAdmin1Row,
    );
    const alternateNames = await readSelectedAlternateNames(
      paths.alternateNamesPath,
      collectWantedIds(selectLargeCities(cityRows), admin1Rows),
    );
    const { zoneCities, timeZoneAliases } = loadZoneData();
    const dataset = compileCityData({
      cityRows,
      admin1Rows,
      alternateNames,
      zoneCities,
      timeZoneAliases,
      releaseZones: readReleaseZoneIds(
        await dependencies.readFile(ZONE_RULES_RELEASE_FILE),
      ),
      dumpDate: paths.dumpDate,
    });
    await dependencies.writeFile(DATASET_PATH, serializeCityDataset(dataset));
    dependencies.log(
      `Wrote ${DATASET_PATH} with ${dataset.cities.length} cities`,
    );
    return 0;
  } catch (error) {
    dependencies.log(
      `Compiling the city data failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
}

// Stryker disable all: the entry point binds the real dependencies; the maintainer run covers it
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runCityDataCompile({
    runProcess: runChildProcess,
    fetchDump: fetchBytes,
    readFile: (path) => readFile(path, "utf8"),
    writeFile,
    log: console.log,
  });
}
// Stryker restore all
