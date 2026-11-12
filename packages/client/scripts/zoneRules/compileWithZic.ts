/**
 * Unpacks a tzdata archive, checks its `version` file against the requested
 * release, compiles the source files with the system `zic -b slim`, reads
 * every TZif file and truncates it to the cutoff.
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */
import { mkdir, readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import type { RunProcess } from "./processTypes.ts";
import { readTzif } from "./readTzif.ts";
import { type ReleaseZone, truncateToCutoff } from "./truncateToCutoff.ts";

export const TZDATA_SOURCE_FILES = [
  "africa",
  "antarctica",
  "asia",
  "australasia",
  "europe",
  "northamerica",
  "southamerica",
  "etcetera",
  "backward",
];

const VERSION_FILE = "version";
const LINK_LINE = /^Link\s+(\S+)\s+(\S+)/;
const ZONE_ID_SEPARATOR = "/";

export type CompiledZones = {
  zones: Map<string, ReleaseZone>;
  /** Link name to target name, from the `Link` lines of the source files. */
  links: Map<string, string>;
};

async function runChecked(
  runProcess: RunProcess,
  command: string,
  args: string[],
): Promise<void> {
  const result = await runProcess(command, args);
  if (result.exitCode !== 0) {
    throw new Error(
      `${command} failed (exit ${result.exitCode}): ${result.stderr}`,
    );
  }
}

async function readLinks(
  sourceDirectory: string,
): Promise<Map<string, string>> {
  const links = new Map<string, string>();
  for (const fileName of TZDATA_SOURCE_FILES) {
    const text = await readFile(join(sourceDirectory, fileName), "utf8");
    for (const line of text.split("\n")) {
      const match = LINK_LINE.exec(line);
      if (match) links.set(match[2] as string, match[1] as string);
    }
  }
  return links;
}

async function readCompiledZones(
  outputDirectory: string,
  links: Map<string, string>,
): Promise<Map<string, ReleaseZone>> {
  const zones = new Map<string, ReleaseZone>();
  const entries = await readdir(outputDirectory, {
    recursive: true,
    withFileTypes: true,
  });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = join(entry.parentPath, entry.name);
    const zoneId = relative(outputDirectory, filePath)
      .split(sep)
      .join(ZONE_ID_SEPARATOR);
    if (links.has(zoneId)) continue;
    zones.set(
      zoneId,
      truncateToCutoff(readTzif(new Uint8Array(await readFile(filePath)))),
    );
  }
  return zones;
}

export async function compileWithZic(
  archivePath: string,
  release: string,
  workDirectory: string,
  runProcess: RunProcess,
): Promise<CompiledZones> {
  const sourceDirectory = join(workDirectory, "source");
  const outputDirectory = join(workDirectory, "compiled");
  await mkdir(sourceDirectory, { recursive: true });
  await runChecked(runProcess, "tar", [
    "-xzf",
    archivePath,
    "-C",
    sourceDirectory,
  ]);
  const archiveVersion = (
    await readFile(join(sourceDirectory, VERSION_FILE), "utf8")
  ).trim();
  if (archiveVersion !== release) {
    throw new Error(
      `The archive's version file names ${archiveVersion}, but ${release} was requested`,
    );
  }
  await runChecked(runProcess, "zic", [
    "-b",
    "slim",
    "-d",
    outputDirectory,
    ...TZDATA_SOURCE_FILES.map((fileName) => join(sourceDirectory, fileName)),
  ]);
  const links = await readLinks(sourceDirectory);
  return { zones: await readCompiledZones(outputDirectory, links), links };
}
