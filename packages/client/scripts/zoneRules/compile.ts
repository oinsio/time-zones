/**
 * The zone rules compiler: `pnpm --filter @time-zones/client zone-rules:compile
 * 2026f` downloads the release from IANA, verifies its signature against the
 * pinned key, builds the zone tools from the release's code archive, compiles
 * it with their `zic -b slim` and writes the release file.
 * Implements FR7 of add-zone-rules-from-iana (design D7), FR5 of add-remote-zone-rules-updates.
 * Implements FR2, FR3 of add-city-coordinates-to-locations (D3): also writes the zone coordinates.
 * Implements FR1, FR3 of build-zic-from-tzcode (D2): the zone tools of the release.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../app.config.ts";
import { parseReleaseName } from "../../src/lib/zoneRules/core/index.ts";
import { buildZoneTools } from "./buildZoneTools.ts";
import { compileWithZic } from "./compileWithZic.ts";
import { ArchiveKind, downloadRelease, fetchBytes } from "./downloadRelease.ts";
import { parseZoneTable } from "./parseZoneTable.ts";
import type { FetchRelease, RunProcess } from "./processTypes.ts";
import { runChildProcess } from "./runChildProcess.ts";
import { verifySignature } from "./verifySignature.ts";
import { writeRelease } from "./writeRelease.ts";
import { writeZoneCoordinates } from "./writeZoneCoordinates.ts";

const USAGE =
  "Usage: node scripts/zoneRules/compile.ts <release>  (a release name such as 2026f)";
const WORK_DIRECTORY_PREFIX = "zone-rules-compile-";
const FIRST_ARGUMENT_INDEX = 2;

export type ZoneRulesCompileDependencies = {
  argv: string[];
  runProcess: RunProcess;
  fetchRelease: FetchRelease;
  writeFile: (path: string, text: string) => Promise<void>;
  log: (line: string) => void;
};

/** Runs the whole flow and returns the exit code; writes the release only on success. */
export async function runZoneRulesCompile(
  dependencies: ZoneRulesCompileDependencies,
): Promise<number> {
  const [release] = dependencies.argv;
  // Stryker disable next-line ConditionalExpression: equivalent — parseReleaseName(undefined) tests the text "undefined" and returns undefined
  if (release === undefined || parseReleaseName(release) === undefined) {
    dependencies.log(USAGE);
    return 1;
  }
  const workDirectory = await mkdtemp(join(tmpdir(), WORK_DIRECTORY_PREFIX));
  try {
    const { archivePath, signaturePath } = await downloadRelease(
      release,
      ArchiveKind.DATA,
      dependencies.fetchRelease,
      workDirectory,
    );
    await verifySignature(archivePath, signaturePath, dependencies.runProcess);
    const { zicPath } = await buildZoneTools(
      release,
      archivePath,
      workDirectory,
      dependencies,
    );
    const { zones, links, zoneTable } = await compileWithZic(
      archivePath,
      release,
      workDirectory,
      dependencies.runProcess,
      zicPath,
    );
    // Every step that can fail ran above: both files are written together.
    const zoneCoordinatesText = writeZoneCoordinates({
      release,
      zones: parseZoneTable(zoneTable),
    });
    await dependencies.writeFile(
      ZONE_RULES_RELEASE_FILE,
      writeRelease({ release, zones, links }),
    );
    await dependencies.writeFile(ZONE_COORDINATES_FILE, zoneCoordinatesText);
    dependencies.log(
      `Wrote ${ZONE_RULES_RELEASE_FILE} and ${ZONE_COORDINATES_FILE} for the release ${release}`,
    );
    return 0;
  } catch (error) {
    dependencies.log(
      `Compiling ${release} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  } finally {
    // Stryker disable next-line BooleanLiteral: equivalent — mkdtemp created the work directory and no step removes it, so force never applies
    await rm(workDirectory, { recursive: true, force: true });
  }
}

// Stryker disable all: the entry point binds the real dependencies; Node smoke runs cover it
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runZoneRulesCompile({
    argv: process.argv.slice(FIRST_ARGUMENT_INDEX),
    runProcess: runChildProcess,
    fetchRelease: fetchBytes,
    writeFile,
    log: console.log,
  });
}
// Stryker restore all
