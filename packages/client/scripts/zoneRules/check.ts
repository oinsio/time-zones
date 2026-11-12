/**
 * The zone rules check: `pnpm --filter @time-zones/client zone-rules:check`
 * compiles the release the committed file names (or takes `--compiled <dir>`),
 * runs `zdump -v -c 2000,2041` on the absolute path of every compiled file and
 * compares each zone with the committed release. Prints `0 differences` or the
 * first difference, and exits non-zero on a difference.
 * Implements FR8 of add-zone-rules-from-iana (design D7).
 */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import {
  parseZoneRulesRelease,
  type ZoneRulesRelease,
  ZoneRulesReleaseError,
} from "../../src/lib/zoneRules/core/index.ts";
import {
  compareWithRelease,
  parseZdumpLines,
  type ZdumpDifference,
} from "./checkAgainstZdump.ts";
import { compileArchive, listCompiledZoneIds } from "./compileWithZic.ts";
import { downloadRelease, fetchBytes } from "./downloadRelease.ts";
import type { FetchRelease, RunProcess } from "./processTypes.ts";
import { runChildProcess } from "./runChildProcess.ts";
import { verifySignature } from "./verifySignature.ts";

const COMPILED_OPTION = "--compiled";
const ZDUMP_ARGUMENTS = ["-v", "-c", "2000,2041"];
const WORK_DIRECTORY_PREFIX = "zone-rules-check-";
const ZONE_ID_SEPARATOR = "/";
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

function groupZdumpLinesByZone(
  stdout: string,
  compiledDirectory: string,
): Map<string, string> {
  const linesByZone = new Map<string, string[]>();
  for (const line of stdout.split("\n")) {
    const [path] = line.split(/\s+/);
    if (!path) continue;
    const zoneId = relative(compiledDirectory, path)
      .split(sep)
      .join(ZONE_ID_SEPARATOR);
    linesByZone.set(zoneId, [...(linesByZone.get(zoneId) ?? []), line]);
  }
  return new Map(
    [...linesByZone].map(([zoneId, lines]) => [zoneId, lines.join("\n")]),
  );
}

function findMissingZone(
  release: ZoneRulesRelease,
  compiledZoneIds: string[],
): ZdumpDifference | undefined {
  const compiledIds = new Set(compiledZoneIds);
  const onlyCompiled = compiledZoneIds.find(
    (zoneId) => !release.zones.has(zoneId),
  );
  const onlyRelease = [...release.zones.keys()].find(
    (zoneId) => !compiledIds.has(zoneId),
  );
  const zoneId = onlyCompiled ?? onlyRelease;
  if (zoneId === undefined) return undefined;
  return {
    zoneId,
    instant: "-",
    expected: onlyCompiled ? "a zone of the release" : "a compiled zone file",
    actual: onlyCompiled
      ? "no such zone in the release"
      : "no such compiled file",
  };
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runZoneRulesCheck({
    argv: process.argv.slice(FIRST_ARGUMENT_INDEX),
    runProcess: runChildProcess,
    fetchRelease: fetchBytes,
    readFile: (path) => readFile(path, "utf8"),
    log: console.log,
  });
}
