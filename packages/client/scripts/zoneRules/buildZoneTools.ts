/**
 * Builds the zone tools of a release: downloads the signed code archive
 * `tzcode<release>.tar.gz`, verifies it against the pinned key, unpacks it and
 * then the data archive into one directory (IANA's layout, which the Makefile
 * needs) and runs `make zic zdump`. The system `zic` and `zdump` are never used.
 * Implements FR1, FR2, FR3, FR5 of build-zic-from-tzcode (D2, D3).
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { readArchiveVersion, runChecked } from "./compileWithZic.ts";
import { ArchiveKind, downloadRelease } from "./downloadRelease.ts";
import type { FetchRelease, RunProcess } from "./processTypes.ts";
import { verifySignature } from "./verifySignature.ts";

const TOOLS_DIRECTORY = "tools";
const ZIC = "zic";
const ZDUMP = "zdump";

/** The `zic` and `zdump` built from the code archive of one release. */
export type ZoneTools = { zicPath: string; zdumpPath: string };

export type ZoneToolsDependencies = {
  runProcess: RunProcess;
  fetchRelease: FetchRelease;
};

export async function buildZoneTools(
  release: string,
  dataArchivePath: string,
  workDirectory: string,
  { runProcess, fetchRelease }: ZoneToolsDependencies,
): Promise<ZoneTools> {
  const { archivePath, signaturePath } = await downloadRelease(
    release,
    ArchiveKind.CODE,
    fetchRelease,
    workDirectory,
  );
  await verifySignature(archivePath, signaturePath, runProcess);
  const toolsDirectory = join(workDirectory, TOOLS_DIRECTORY);
  await mkdir(toolsDirectory);
  await runChecked(runProcess, "tar", [
    "-xzf",
    archivePath,
    "-C",
    toolsDirectory,
  ]);
  const codeVersion = await readArchiveVersion(toolsDirectory);
  if (codeVersion !== release) {
    throw new Error(
      `The code archive's version file names ${codeVersion}, but ${release} was requested`,
    );
  }
  await runChecked(runProcess, "tar", [
    "-xzf",
    dataArchivePath,
    "-C",
    toolsDirectory,
  ]);
  await runChecked(runProcess, "make", ["-C", toolsDirectory, ZIC, ZDUMP]);
  return {
    zicPath: join(toolsDirectory, ZIC),
    zdumpPath: join(toolsDirectory, ZDUMP),
  };
}
