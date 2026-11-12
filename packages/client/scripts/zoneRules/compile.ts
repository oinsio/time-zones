/**
 * The zone rules compiler: `pnpm --filter @time-zones/client zone-rules:compile
 * 2026f` downloads the release from IANA, verifies its signature against the
 * pinned key, compiles it with `zic -b slim` and writes the release file.
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import { compileWithZic } from "./compileWithZic.ts";
import { downloadRelease, fetchBytes } from "./downloadRelease.ts";
import type { FetchRelease, RunProcess } from "./processTypes.ts";
import { runChildProcess } from "./runChildProcess.ts";
import { verifySignature } from "./verifySignature.ts";
import { writeRelease } from "./writeRelease.ts";

const USAGE =
  "Usage: node scripts/zoneRules/compile.ts <release>  (a release name such as 2026f)";
const RELEASE_NAME = /^\d{4}[a-z]$/;
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
  if (release === undefined || !RELEASE_NAME.test(release)) {
    dependencies.log(USAGE);
    return 1;
  }
  const workDirectory = await mkdtemp(join(tmpdir(), WORK_DIRECTORY_PREFIX));
  try {
    const { archivePath, signaturePath } = await downloadRelease(
      release,
      dependencies.fetchRelease,
      workDirectory,
    );
    await verifySignature(archivePath, signaturePath, dependencies.runProcess);
    const { zones, links } = await compileWithZic(
      archivePath,
      release,
      workDirectory,
      dependencies.runProcess,
    );
    await dependencies.writeFile(
      ZONE_RULES_RELEASE_FILE,
      writeRelease({ release, zones, links }),
    );
    dependencies.log(
      `Wrote ${ZONE_RULES_RELEASE_FILE} for the release ${release}`,
    );
    return 0;
  } catch (error) {
    dependencies.log(
      `Compiling ${release} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runZoneRulesCompile({
    argv: process.argv.slice(FIRST_ARGUMENT_INDEX),
    runProcess: runChildProcess,
    fetchRelease: fetchBytes,
    writeFile,
    log: console.log,
  });
}
