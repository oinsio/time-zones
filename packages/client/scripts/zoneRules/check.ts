/**
 * The zone rules check: `pnpm --filter @time-zones/client zone-rules:check`
 * compiles the release the committed file names (or takes `--compiled <dir>`),
 * runs `zdump -v -c 2000,2041` on the absolute path of every compiled file and
 * compares each zone with the committed release. Prints `0 differences` or the
 * first difference, and exits non-zero on a difference.
 * Implements FR8 of add-zone-rules-from-iana (design D7).
 * Implements FR4 of add-city-coordinates-to-locations (D4): also checks the zone coordinates.
 */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../app.config.ts";
import {
  parseZoneRulesRelease,
  type ZoneRulesRelease,
  ZoneRulesReleaseError,
} from "../../src/lib/zoneRules/core/index.ts";
import { loadZoneData } from "../zoneData/loadZoneData.ts";
import {
  compareWithRelease,
  parseZdumpLines,
  type ZdumpDifference,
} from "./checkAgainstZdump.ts";
import { checkZoneCoordinates } from "./checkZoneCoordinates.ts";
import { compileArchive, listCompiledZoneIds } from "./compileWithZic.ts";
import { downloadRelease, fetchBytes } from "./downloadRelease.ts";
import type { FetchRelease, RunProcess } from "./processTypes.ts";
import { runChildProcess } from "./runChildProcess.ts";
import { verifySignature } from "./verifySignature.ts";
import { findMissingZone, groupZdumpLinesByZone } from "./zdumpZoneLookup.ts";

const COMPILED_OPTION = "--compiled";
const ZDUMP_ARGUMENTS = ["-v", "-c", "2000,2041"];
const WORK_DIRECTORY_PREFIX = "zone-rules-check-";
const FIRST_ARGUMENT_INDEX = 2;
const NO_DIFFERENCES = "0 differences";

export type ZoneRulesCheckDependencies = {
  argv: string[];
  runProcess: RunProcess;
  fetchRelease: FetchRelease;
  readFile: (path: string) => Promise<string>;
  log: (line: string) => void;
};

async function readCommittedRelease(
  dependencies: ZoneRulesCheckDependencies,
): Promise<ZoneRulesRelease> {
  const release = parseZoneRulesRelease(
    JSON.parse(await dependencies.readFile(ZONE_RULES_RELEASE_FILE)),
  );
  if (release instanceof ZoneRulesReleaseError) throw release;
  return release;
}

async function compileNamedRelease(
  release: string,
  workDirectory: string,
  dependencies: ZoneRulesCheckDependencies,
): Promise<string> {
  const { archivePath, signaturePath } = await downloadRelease(
    release,
    dependencies.fetchRelease,
    workDirectory,
  );
  await verifySignature(archivePath, signaturePath, dependencies.runProcess);
  const { outputDirectory } = await compileArchive(
    archivePath,
    release,
    workDirectory,
    dependencies.runProcess,
  );
  return outputDirectory;
}

async function findFirstDifference(
  release: ZoneRulesRelease,
  compiledDirectory: string,
  runProcess: RunProcess,
): Promise<ZdumpDifference | undefined> {
  const compiledZoneIds = await listCompiledZoneIds(compiledDirectory);
  const missingZone = findMissingZone(release, compiledZoneIds);
  if (missingZone) return missingZone;
  const result = await runProcess("zdump", [
    ...ZDUMP_ARGUMENTS,
    ...compiledZoneIds.map((zoneId) => join(compiledDirectory, zoneId)),
  ]);
  if (result.exitCode !== 0) {
    throw new Error(`zdump failed (exit ${result.exitCode}): ${result.stderr}`);
  }
  const textByZone = groupZdumpLinesByZone(result.stdout, compiledDirectory);
  for (const zoneId of compiledZoneIds) {
    const difference = compareWithRelease(
      release,
      zoneId,
      parseZdumpLines(textByZone.get(zoneId) ?? ""),
    );
    if (difference) return difference;
  }
  return undefined;
}

/** Runs the whole check and returns the exit code. */
export async function runZoneRulesCheck(
  dependencies: ZoneRulesCheckDependencies,
): Promise<number> {
  const { argv, log } = dependencies;
  const compiledOptionIndex = argv.indexOf(COMPILED_OPTION);
  const workDirectory = await mkdtemp(join(tmpdir(), WORK_DIRECTORY_PREFIX));
  try {
    const release = await readCommittedRelease(dependencies);
    const coordinatesErrors = checkZoneCoordinates(
      await dependencies.readFile(ZONE_COORDINATES_FILE),
      release.release,
      loadZoneData().zoneCities,
    );
    if (coordinatesErrors.length > 0) {
      for (const error of coordinatesErrors) log(error);
      return 1;
    }
    const compiledDirectory =
      compiledOptionIndex >= 0
        ? resolve(argv[compiledOptionIndex + 1] ?? "")
        : await compileNamedRelease(
            release.release,
            workDirectory,
            dependencies,
          );
    const difference = await findFirstDifference(
      release,
      compiledDirectory,
      dependencies.runProcess,
    );
    if (difference) {
      log(
        `${difference.zoneId} differs at ${difference.instant}: zdump says ${difference.expected}, the release says ${difference.actual}`,
      );
      return 1;
    }
    log(NO_DIFFERENCES);
    return 0;
  } catch (error) {
    log(
      `The zone rules check failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
}

// Stryker disable all: the entry point binds the real dependencies; Node smoke runs cover it
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runZoneRulesCheck({
    argv: process.argv.slice(FIRST_ARGUMENT_INDEX),
    runProcess: runChildProcess,
    fetchRelease: fetchBytes,
    readFile: (path) => readFile(path, "utf8"),
    log: console.log,
  });
}
// Stryker restore all
