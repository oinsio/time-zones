/**
 * Downloads the three GeoNames dumps into a directory, extracts the archives
 * with the system `unzip` and streams the alternate names, keeping only the
 * rows of wanted IDs in the name languages.
 * Implements FR12 of add-geonames-city-source (D8).
 */
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { Temporal } from "../../src/lib/temporal.ts";
import type { FetchRelease, RunProcess } from "../zoneRules/processTypes.ts";
import type { AlternateNamesByCity } from "./cityDataTypes.ts";
import {
  ADMIN1_FILE_NAME,
  ALTERNATE_NAMES_ARCHIVE_NAME,
  ALTERNATE_NAMES_FILE_NAME,
  CITIES_ARCHIVE_NAME,
  CITIES_FILE_NAME,
  COLUMN_SEPARATOR,
  DUMP_ENTRY_TIME_PATTERN,
  GEONAMES_DUMP_BASE_URL,
  NAME_LANGUAGES,
  UNZIP_COMMAND,
  UNZIP_LIST_FLAGS,
} from "./constants.ts";
import { parseAlternateNameRow } from "./parseGeoNamesRows.ts";

const UNZIP_OVERWRITE_FLAG = "-o";
const UNZIP_DIRECTORY_FLAG = "-d";
const ID_COLUMN = 1;
const LANGUAGE_COLUMN = 2;
const KEPT_PREFIX_COLUMNS = 3;

export type DumpPaths = {
  citiesPath: string;
  alternateNamesPath: string;
  admin1Path: string;
  /** The day GeoNames built the cities dump, as an ISO date. */
  dumpDate: string;
};

async function fetchDumpFile(
  fetchDump: FetchRelease,
  dumpName: string,
  directory: string,
): Promise<string> {
  const path = join(directory, dumpName);
  try {
    await writeFile(
      path,
      await fetchDump(`${GEONAMES_DUMP_BASE_URL}${dumpName}`),
    );
  } catch (error) {
    throw new Error(
      `Downloading the dump ${dumpName} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return path;
}

async function extractArchive(
  runProcess: RunProcess,
  archivePath: string,
  archiveName: string,
  directory: string,
): Promise<void> {
  const { exitCode, stderr } = await runProcess(UNZIP_COMMAND, [
    UNZIP_OVERWRITE_FLAG,
    archivePath,
    UNZIP_DIRECTORY_FLAG,
    directory,
  ]);
  if (exitCode !== 0) {
    throw new Error(`Extracting the dump ${archiveName} failed: ${stderr}`);
  }
}

function dumpDateError(archiveName: string, cause: string): Error {
  return new Error(
    `Reading the date of the dump ${archiveName} failed: ${cause}`,
  );
}

/** Reads the build day of the dump from the entry time in its archive; the time has no zone, so only its date is taken. */
async function readDumpDate(
  runProcess: RunProcess,
  archivePath: string,
  archiveName: string,
  entryName: string,
): Promise<string> {
  const { exitCode, stdout, stderr } = await runProcess(UNZIP_COMMAND, [
    ...UNZIP_LIST_FLAGS,
    archivePath,
    entryName,
  ]);
  const match = DUMP_ENTRY_TIME_PATTERN.exec(stdout);
  const failure = exitCode !== 0 ? stderr : stdout;
  if (exitCode !== 0 || match === null)
    throw dumpDateError(archiveName, failure);
  const [, year, month, day] = match;
  try {
    return Temporal.PlainDate.from(`${year}-${month}-${day}`).toString();
  } catch {
    throw dumpDateError(archiveName, stdout);
  }
}

/** Fetches the dumps into `directory`; a failed download throws naming the dump. */
export async function downloadDumps(
  fetchDump: FetchRelease,
  runProcess: RunProcess,
  directory: string,
): Promise<DumpPaths> {
  const citiesArchive = await fetchDumpFile(
    fetchDump,
    CITIES_ARCHIVE_NAME,
    directory,
  );
  const namesArchive = await fetchDumpFile(
    fetchDump,
    ALTERNATE_NAMES_ARCHIVE_NAME,
    directory,
  );
  const admin1Path = await fetchDumpFile(
    fetchDump,
    ADMIN1_FILE_NAME,
    directory,
  );
  await extractArchive(
    runProcess,
    citiesArchive,
    CITIES_ARCHIVE_NAME,
    directory,
  );
  await extractArchive(
    runProcess,
    namesArchive,
    ALTERNATE_NAMES_ARCHIVE_NAME,
    directory,
  );
  const dumpDate = await readDumpDate(
    runProcess,
    citiesArchive,
    CITIES_ARCHIVE_NAME,
    CITIES_FILE_NAME,
  );
  return {
    dumpDate,
    citiesPath: join(directory, CITIES_FILE_NAME),
    alternateNamesPath: join(directory, ALTERNATE_NAMES_FILE_NAME),
    admin1Path,
  };
}

/** Streams the alternate names file, keeping rows of wanted IDs in the name languages only. */
export async function readSelectedAlternateNames(
  path: string,
  wantedIds: ReadonlySet<number>,
): Promise<AlternateNamesByCity> {
  const alternateNames: AlternateNamesByCity = new Map();
  const lines = createInterface({
    input: createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  let lineNumber = 0;
  for await (const line of lines) {
    lineNumber += 1;
    const prefix = line.split(COLUMN_SEPARATOR, KEPT_PREFIX_COLUMNS);
    if (!NAME_LANGUAGES.includes(prefix[LANGUAGE_COLUMN] ?? "")) continue;
    if (!wantedIds.has(Number(prefix[ID_COLUMN]))) continue;
    const row = parseAlternateNameRow(line, lineNumber);
    alternateNames.set(row.geonameId, [
      ...(alternateNames.get(row.geonameId) ?? []),
      row,
    ]);
  }
  return alternateNames;
}
