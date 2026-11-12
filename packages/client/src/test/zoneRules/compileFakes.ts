/**
 * Fakes for the zone rules compiler tests: a process runner that records its
 * calls and plays `gpg`, `tar` and `zic`, and a download that records URLs.
 * Implements FR7 of add-zone-rules-from-iana.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { TZDATA_SOURCE_FILES } from "../../../scripts/zoneRules/compileWithZic.ts";
import type {
  FetchRelease,
  ProcessResult,
  RunProcess,
} from "../../../scripts/zoneRules/processTypes.ts";
import { buildTzif } from "./buildTzif";

export type ProcessCall = {
  command: string;
  args: string[];
  env: Record<string, string> | undefined;
};

export type FakeScenario = {
  /** The `--status-fd` output of `gpg --verify`; empty means no valid signature. */
  verifyStatus: string;
  /** The content of the archive's `version` file. */
  archiveVersion: string;
  /** The exit code of `gpg --import`. */
  importExitCode?: number;
  /** The exit code of `tar`, with its error text; the archive is not unpacked. */
  tarFailure?: { exitCode: number; stderr: string };
  /** The exit code of `zic`, with its error text; nothing is compiled. */
  zicFailure?: { exitCode: number; stderr: string };
};

export const VALID_VERIFY_STATUS_FILE = join(
  __dirname,
  "fixtures",
  "gpg-verify-valid.status.txt",
);

const SUCCESS: ProcessResult = { exitCode: 0, stdout: "", stderr: "" };
const EST = {
  utcOffsetSeconds: -18000,
  isDaylightSavingTime: false,
  designation: "EST",
};
const EDT = {
  utcOffsetSeconds: -14400,
  isDaylightSavingTime: true,
  designation: "EDT",
};
const IST = {
  utcOffsetSeconds: 19800,
  isDaylightSavingTime: false,
  designation: "IST",
};

function writeTzif(outputDirectory: string, zoneId: string, file: Uint8Array) {
  const path = join(outputDirectory, zoneId);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, file);
}

function playTar(args: string[], scenario: FakeScenario) {
  const directory = args[args.indexOf("-C") + 1] as string;
  writeFileSync(join(directory, "version"), `${scenario.archiveVersion}\n`);
  for (const fileName of TZDATA_SOURCE_FILES) {
    writeFileSync(join(directory, fileName), "# no zones here\n");
  }
  writeFileSync(join(directory, "asia"), "Zone Asia/Kolkata 5:30 - IST\n");
  writeFileSync(
    join(directory, "backward"),
    "# a comment\n#Link Bogus/Target Bogus/Name\nLink\tAsia/Kolkata\tAsia/Calcutta\nLink Asia/Calcutta Asia/Calcutta2\nLink  \t Asia/Kolkata \t  Asia/Calcutta3\n",
  );
}

function playZic(args: string[]) {
  const outputDirectory = args[args.indexOf("-d") + 1] as string;
  const newYork = buildTzif({
    types: [EST, EDT],
    transitions: [[1173596400, 1]],
    footer: "EST5EDT,M3.2.0,M11.1.0",
  });
  const kolkata = buildTzif({
    types: [IST],
    transitions: [],
    footer: "IST-5:30",
  });
  writeTzif(outputDirectory, "America/New_York", newYork);
  writeTzif(outputDirectory, "Asia/Kolkata", kolkata);
  writeTzif(outputDirectory, "Asia/Calcutta", kolkata);
  writeTzif(outputDirectory, "Asia/Calcutta2", kolkata);
  writeTzif(outputDirectory, "Asia/Calcutta3", kolkata);
}

export function createFakeProcessRunner(scenario: FakeScenario): {
  runProcess: RunProcess;
  calls: ProcessCall[];
} {
  const calls: ProcessCall[] = [];
  const runProcess: RunProcess = async (command, args, options) => {
    calls.push({ command, args, env: options?.env });
    if (command === "gpg" && args.includes("--import")) {
      return { ...SUCCESS, exitCode: scenario.importExitCode ?? 0 };
    }
    if (command === "gpg" && args.includes("--verify")) {
      return { ...SUCCESS, stdout: scenario.verifyStatus };
    }
    if (command === "tar" && scenario.tarFailure) {
      return { ...scenario.tarFailure, stdout: "" };
    }
    if (command === "zic" && scenario.zicFailure) {
      return { ...scenario.zicFailure, stdout: "" };
    }
    if (command === "tar") playTar(args, scenario);
    if (command === "zic") playZic(args);
    return SUCCESS;
  };
  return { runProcess, calls };
}

export function createFakeFetch(): {
  fetchRelease: FetchRelease;
  urls: string[];
} {
  const urls: string[] = [];
  const fetchRelease: FetchRelease = async (url) => {
    urls.push(url);
    return new TextEncoder().encode(`bytes of ${url}`);
  };
  return { fetchRelease, urls };
}
