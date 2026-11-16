/**
 * The three commands of the data refresh command line, over injected dependencies.
 * Implements FR3, FR5, FR6, FR7, FR8 of refresh-data-through-scheduled-pull-requests (D5).
 */
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../app.config.ts";
import type { CityDataset } from "../cityData/cityDataTypes.ts";
import { DATASET_PATH } from "../cityData/constants.ts";
import {
  findPathsOutsideData,
  findSourceOfBranch,
} from "./checkDataOnlyPaths.ts";
import { compareCityData } from "./compareCityData.ts";
import { compareZoneRules } from "./compareZoneRules.ts";
import {
  CLIENT_MANIFEST_PATH,
  REFRESH_COMMANDS,
  REFRESH_OUTPUT_KEYS,
  REFRESH_SOURCES,
  REFRESH_VERDICTS,
  type RefreshSource,
} from "./refreshConstants.ts";
import {
  buildRefreshFailureIssue,
  buildRefreshRecoveryComment,
} from "./refreshFailureIssue.ts";
import {
  buildRefreshPullRequest,
  type RefreshPullRequest,
} from "./refreshPullRequest.ts";
import {
  decideCityDataRefresh,
  decideZoneRulesRefresh,
  type RefreshDecision,
} from "./refreshVerdict.ts";

const AUTO_SOURCE = "auto";
export const EXIT_CODE_OK = 0;
export const EXIT_CODE_FAILED = 1;
export const USAGE = `Usage: cli.ts ${REFRESH_COMMANDS.VERDICT} <${REFRESH_SOURCES.ZONE_RULES}|${REFRESH_SOURCES.CITY_DATA}> | ${REFRESH_COMMANDS.CHECK_PATHS} <source|${AUTO_SOURCE}> <base> <head> | ${REFRESH_COMMANDS.ISSUE} <source> <step> <url>`;

export type DataRefreshDependencies = {
  /** A file of `HEAD`, by path relative to the client package; `undefined` when it does not exist. */
  readCommittedFile: (path: string) => Promise<string | undefined>;
  /** A file of the working copy, by path relative to the client package. */
  readRefreshedFile: (path: string) => Promise<string | undefined>;
  listChangedPaths: (base: string, head: string) => Promise<string[]>;
  readManifestDiff: (base: string, head: string) => Promise<string>;
  readCurrentBranch: () => Promise<string>;
  /** `$GITHUB_HEAD_REF`: the head branch of a pull request run. */
  headBranchFromEnvironment: string | undefined;
  writeOutput: (key: string, value: string) => Promise<void>;
  /** Writes a text file and returns its path. */
  writeTextFile: (fileName: string, content: string) => Promise<string>;
  log: (line: string) => void;
};

type ReadFile = (path: string) => Promise<string | undefined>;

function isRefreshSource(name: string): name is RefreshSource {
  return (Object.values(REFRESH_SOURCES) as string[]).includes(name);
}

async function requireFile(read: ReadFile, path: string): Promise<string> {
  const content = await read(path);
  if (content === undefined) {
    throw new Error(`Missing file ${path}`);
  }
  return content;
}

async function readZoneRulesInputs(read: ReadFile) {
  const coordinates = await read(ZONE_COORDINATES_FILE);
  return {
    release: JSON.parse(await requireFile(read, ZONE_RULES_RELEASE_FILE)),
    coordinates:
      coordinates === undefined ? undefined : JSON.parse(coordinates),
  };
}

async function readCityData(read: ReadFile): Promise<CityDataset> {
  return JSON.parse(await requireFile(read, DATASET_PATH));
}

export async function runVerdict(
  source: string,
  dependencies: DataRefreshDependencies,
): Promise<number> {
  const { readCommittedFile, readRefreshedFile } = dependencies;
  let decision: RefreshDecision;
  let pullRequest: RefreshPullRequest;
  if (source === REFRESH_SOURCES.ZONE_RULES) {
    const refreshed = await readZoneRulesInputs(readRefreshedFile);
    decision = decideZoneRulesRefresh(
      compareZoneRules(await readZoneRulesInputs(readCommittedFile), refreshed),
    );
    pullRequest = buildRefreshPullRequest(
      source,
      refreshed.release.release,
      decision,
    );
  } else if (source === REFRESH_SOURCES.CITY_DATA) {
    const refreshed = await readCityData(readRefreshedFile);
    decision = decideCityDataRefresh(
      compareCityData(await readCityData(readCommittedFile), refreshed),
    );
    pullRequest = buildRefreshPullRequest(
      source,
      refreshed.source.dumpDate,
      decision,
    );
  } else {
    dependencies.log(USAGE);
    return EXIT_CODE_FAILED;
  }
  dependencies.log(decision.verdict);
  for (const reason of decision.reasons) {
    dependencies.log(`- ${reason}`);
  }
  await dependencies.writeOutput(REFRESH_OUTPUT_KEYS.VERDICT, decision.verdict);
  if (decision.verdict !== REFRESH_VERDICTS.UNCHANGED) {
    await dependencies.writeOutput(
      REFRESH_OUTPUT_KEYS.TITLE,
      pullRequest.title,
    );
    await dependencies.writeOutput(
      REFRESH_OUTPUT_KEYS.BODY_FILE,
      await dependencies.writeTextFile("body.md", pullRequest.body),
    );
    await dependencies.writeOutput(
      REFRESH_OUTPUT_KEYS.MERGE_BODY_FILE,
      await dependencies.writeTextFile("merge-body.md", pullRequest.mergeBody),
    );
  }
  return EXIT_CODE_OK;
}

async function findCheckedSource(
  sourceArgument: string,
  dependencies: DataRefreshDependencies,
): Promise<RefreshSource | undefined> {
  if (sourceArgument !== AUTO_SOURCE) {
    return isRefreshSource(sourceArgument) ? sourceArgument : undefined;
  }
  const branchName =
    dependencies.headBranchFromEnvironment ||
    (await dependencies.readCurrentBranch());
  const source = findSourceOfBranch(branchName);
  if (source === undefined) {
    dependencies.log(`${branchName} is not a data refresh branch`);
  }
  return source;
}

export async function runCheckPaths(
  sourceArgument: string,
  base: string,
  head: string,
  dependencies: DataRefreshDependencies,
): Promise<number> {
  const source = await findCheckedSource(sourceArgument, dependencies);
  if (source === undefined) {
    return sourceArgument === AUTO_SOURCE ? EXIT_CODE_OK : EXIT_CODE_FAILED;
  }
  const changedPaths = await dependencies.listChangedPaths(base, head);
  const manifestDiff = changedPaths.includes(CLIENT_MANIFEST_PATH)
    ? await dependencies.readManifestDiff(base, head)
    : undefined;
  const offenders = findPathsOutsideData(source, changedPaths, manifestDiff);
  for (const offender of offenders) {
    dependencies.log(`Outside the data paths of ${source}: ${offender}`);
  }
  return offenders.length === 0 ? EXIT_CODE_OK : EXIT_CODE_FAILED;
}

export async function runIssue(
  source: string,
  failedStep: string,
  url: string,
  dependencies: DataRefreshDependencies,
): Promise<number> {
  if (!isRefreshSource(source)) {
    dependencies.log(USAGE);
    return EXIT_CODE_FAILED;
  }
  const issue = buildRefreshFailureIssue(source, failedStep, url);
  await dependencies.writeOutput(REFRESH_OUTPUT_KEYS.TITLE, issue.title);
  await dependencies.writeOutput(
    REFRESH_OUTPUT_KEYS.BODY_FILE,
    await dependencies.writeTextFile("issue.md", issue.body),
  );
  await dependencies.writeOutput(
    REFRESH_OUTPUT_KEYS.RECOVERY_FILE,
    await dependencies.writeTextFile(
      "recovery.md",
      buildRefreshRecoveryComment(url),
    ),
  );
  return EXIT_CODE_OK;
}
