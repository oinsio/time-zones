/**
 * Command line of the data refresh workflows: `verdict <zone-rules|city-data>`,
 * `check-paths <source|auto> <base> <head>` and `issue <source> <step> <url>`.
 * Outputs go to `$GITHUB_OUTPUT` as `latestRelease.ts` does.
 * Implements FR3, FR5, FR6, FR7, FR8 of refresh-data-through-scheduled-pull-requests (D5).
 */
import { execFile } from "node:child_process";
import { appendFile, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  type DataRefreshDependencies,
  EXIT_CODE_FAILED,
  runCheckPaths,
  runIssue,
  runVerdict,
  USAGE,
} from "./cliCommands.ts";
import { CLIENT_MANIFEST_PATH } from "./refreshConstants.ts";

export async function runDataRefreshCli(
  argumentsList: string[],
  dependencies: DataRefreshDependencies,
): Promise<number> {
  // Stryker disable next-line StringLiteral: an absent argument fails the validation of its command either way
  const [command, first = "", second = "", third = ""] = argumentsList;
  try {
    if (command === "verdict") {
      return await runVerdict(first, dependencies);
    }
    if (command === "check-paths") {
      return await runCheckPaths(first, second, third, dependencies);
    }
    // Stryker disable next-line ConditionalExpression: the fall-through to the usage gives the same exit code and line
    if (command === "issue") {
      return await runIssue(first, second, third, dependencies);
    }
  } catch (error) {
    dependencies.log(
      `Data refresh failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return EXIT_CODE_FAILED;
  }
  dependencies.log(USAGE);
  return EXIT_CODE_FAILED;
}

// Stryker disable all: the entry point binds the real dependencies; Node smoke runs cover it
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const CLIENT_DIRECTORY_IN_REPOSITORY = "packages/client/";
  const GIT_MAX_OUTPUT_BYTES = 256 * 1024 * 1024;
  const runGit = async (gitArguments: string[]) =>
    (
      await promisify(execFile)("git", gitArguments, {
        maxBuffer: GIT_MAX_OUTPUT_BYTES,
      })
    ).stdout;
  const readIfPresent = async (read: () => Promise<string>) => {
    try {
      return await read();
    } catch {
      return undefined;
    }
  };
  process.exitCode = await runDataRefreshCli(process.argv.slice(2), {
    readCommittedFile: (path) =>
      readIfPresent(() =>
        runGit(["show", `HEAD:${CLIENT_DIRECTORY_IN_REPOSITORY}${path}`]),
      ),
    readRefreshedFile: (path) => readIfPresent(() => readFile(path, "utf8")),
    listChangedPaths: async (base, head) =>
      (await runGit(["diff", "--name-only", `${base}..${head}`]))
        .split("\n")
        .filter(Boolean),
    readManifestDiff: (base, head) =>
      runGit(["diff", "-U0", `${base}..${head}`, "--", CLIENT_MANIFEST_PATH]),
    readCurrentBranch: async () =>
      (await runGit(["branch", "--show-current"])).trim(),
    headBranchFromEnvironment: process.env.GITHUB_HEAD_REF,
    writeOutput: async (key, value) => {
      if (process.env.GITHUB_OUTPUT !== undefined) {
        await appendFile(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
      }
    },
    writeTextFile: async (fileName, content) => {
      const path = join(
        await mkdtemp(join(tmpdir(), "data-refresh-")),
        fileName,
      );
      await writeFile(path, content);
      return path;
    },
    log: console.log,
  });
}
// Stryker restore all
