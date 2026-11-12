// @add-zone-rules-from-iana @FR8: fixtures and fakes shared by the zone rules check tests
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runZoneRulesCheck } from "../../../scripts/zoneRules/check.ts";
import type { RunProcess } from "../../../scripts/zoneRules/processTypes.ts";
import {
  createFakeFetch,
  createFakeProcessRunner,
  VALID_VERIFY_STATUS_FILE,
} from "./compileFakes";
import { FIXTURE_RELEASE_DOCUMENT } from "./fixtureReleaseDocument";

export const RELEASE_FILE = "zone-rules/release.json";
export const COMPILED_ZONE_IDS = [
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Calcutta",
  "Asia/Calcutta2",
  "Asia/Calcutta3",
];
const NEW_YORK_ZDUMP = readFileSync(
  join(__dirname, "fixtures", "zdump", "America_New_York.txt"),
  "utf8",
);
export const FIXTURE_NEW_YORK =
  FIXTURE_RELEASE_DOCUMENT.zones["America/New_York"];
export const FIXTURE_KOLKATA = FIXTURE_RELEASE_DOCUMENT.zones["Asia/Kolkata"];

export function buildReleaseText(
  newYorkFutureRule = FIXTURE_NEW_YORK.futureRule,
): string {
  return JSON.stringify({
    release: "2026f",
    cutoff: 946684800,
    zones: {
      "America/New_York": {
        ...FIXTURE_NEW_YORK,
        futureRule: newYorkFutureRule,
      },
      "Asia/Kolkata": FIXTURE_KOLKATA,
      "Asia/Calcutta": "Asia/Kolkata",
      "Asia/Calcutta2": "Asia/Kolkata",
      "Asia/Calcutta3": "Asia/Kolkata",
    },
  });
}

export function createCompiledDirectory(zoneIds = COMPILED_ZONE_IDS): string {
  const directory = mkdtempSync(join(tmpdir(), "compiled-fixture-"));
  for (const zoneId of zoneIds) {
    mkdirSync(dirname(join(directory, zoneId)), { recursive: true });
    writeFileSync(join(directory, zoneId), "");
  }
  return directory;
}

/** Plays zdump: America/New_York gets the captured fixture, every other zone no line. */
function createZdumpRunner(
  zdumpCalls: string[][],
  zdumpFailure = false,
): RunProcess {
  return async (command, args) => {
    if (command !== "zdump") return { exitCode: 0, stdout: "", stderr: "" };
    zdumpCalls.push(args);
    const paths = args.slice(3);
    if (zdumpFailure) return { exitCode: 3, stdout: "", stderr: "zdump broke" };
    const stdout = paths
      .filter((path) => path.endsWith("America/New_York"))
      .flatMap((path) =>
        NEW_YORK_ZDUMP.split("\n")
          .filter(Boolean)
          .map((line) => line.replace(/^\S+/, path)),
      )
      .join("\n");
    const kolkataLines = paths
      .filter((path) => path.endsWith("Asia/Kolkata"))
      .map(
        (path) =>
          `${path}  Sat Jan  1 00:00:05 2000 UT = Sat Jan  1 05:30:05 2000 IST isdst=0 gmtoff=19800`,
      );
    return {
      exitCode: 0,
      stdout: [stdout, ...kolkataLines].filter(Boolean).join("\n"),
      stderr: "",
    };
  };
}

export async function check(
  argv: string[],
  releaseText = buildReleaseText(),
  zdumpFailure = false,
) {
  const zdumpCalls: string[][] = [];
  const logLines: string[] = [];
  const downloads = createFakeFetch();
  const fakes = createFakeProcessRunner({
    verifyStatus: readFileSync(VALID_VERIFY_STATUS_FILE, "utf8"),
    archiveVersion: "2026f",
  });
  const zdumpRunner = createZdumpRunner(zdumpCalls, zdumpFailure);
  const readPaths: string[] = [];
  const exitCode = await runZoneRulesCheck({
    argv,
    runProcess: async (command, args, options) =>
      command === "zdump"
        ? zdumpRunner(command, args)
        : fakes.runProcess(command, args, options),
    fetchRelease: downloads.fetchRelease,
    readFile: async (path) => {
      readPaths.push(path);
      return releaseText;
    },
    log: (line) => logLines.push(line),
  });
  return {
    exitCode,
    logLines,
    zdumpCalls,
    urls: downloads.urls,
    readPaths,
    calls: fakes.calls,
  };
}
