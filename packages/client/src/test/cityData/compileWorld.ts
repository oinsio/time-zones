/**
 * World of the city data compile entry tests: fake download, fake `unzip`
 * that writes fixture dumps, recorded writes and log.
 * Implements FR1, FR11, FR12 of add-geonames-city-source (D8).
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runCityDataCompile } from "../../../scripts/cityData/compile.ts";

const CITY_COLUMNS = 19;
export const DUMP_DATE = "2026-11-13";
const DUMP_LISTING =
  "-rw-r--r--  3.0 unx 12345678 tx 3456789 defN 20261113.031500 cities15000.txt";

export function cityLine(
  id: number,
  name: string,
  zone: string,
  population = 500_000,
): string {
  const columns = Array.from({ length: CITY_COLUMNS }, () => "");
  columns[0] = String(id);
  columns[1] = name;
  columns[7] = "PPL";
  columns[8] = "RU";
  columns[10] = "01";
  columns[14] = String(population);
  columns[17] = zone;
  return columns.join("\t");
}

const KAZAN_RUSSIAN = [
  "1",
  "551487",
  "ru",
  "Казань",
  "1",
  "",
  "",
  "",
  "",
  "",
].join("\t");

export type CompileRun = {
  exitCode: number;
  writes: Map<string, string>;
  log: string[];
  commands: string[];
  /** The temporary directory the run extracted into. */
  workDirectory: string;
};

export async function runCompile(options: {
  cityLines: string[];
  failDownloadOf?: string;
  unzipExitCode?: number;
}): Promise<CompileRun> {
  const writes = new Map<string, string>();
  const log: string[] = [];
  const commands: string[] = [];
  let workDirectory = "";
  const exitCode = await runCityDataCompile({
    fetchDump: async (url) => {
      if (options.failDownloadOf && url.endsWith(options.failDownloadOf)) {
        throw new Error("HTTP 503");
      }
      return url.endsWith(".txt")
        ? new TextEncoder().encode("RU.01\tRegion One\tRegion One\t9001\n")
        : Uint8Array.of(1);
    },
    runProcess: async (command, args) => {
      commands.push(command);
      if (args[0] === "-Z") {
        return { exitCode: 0, stdout: DUMP_LISTING, stderr: "" };
      }
      workDirectory = args[args.length - 1];
      if (options.unzipExitCode) {
        return {
          exitCode: options.unzipExitCode,
          stdout: "",
          stderr: "unzip: bad archive",
        };
      }
      const directory = args[args.length - 1];
      workDirectory = directory;
      await writeFile(
        join(directory, "cities15000.txt"),
        options.cityLines.join("\n"),
      );
      await writeFile(join(directory, "alternateNamesV2.txt"), KAZAN_RUSSIAN);
      return { exitCode: 0, stdout: "", stderr: "" };
    },
    readFile: (path) => readFile(path, "utf8"),
    writeFile: async (path, text) => {
      writes.set(path, text);
    },
    log: (line) => log.push(line),
  });
  return { exitCode, writes, log, commands, workDirectory };
}
