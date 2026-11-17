/**
 * The app revision of the build: the explicit `APP_REVISION`, else the newest
 * commit that is not a data-only commit, else a value unique to the build.
 * Implements FR1, M2 of apply-data-updates-silently (D1).
 */
import { DATA_ONLY_TRAILER } from "../dataRefresh/refreshConstants.ts";
import type { RunProcess } from "../zoneRules/processTypes.ts";
import {
  APP_REVISION_ENVIRONMENT_KEY,
  GIT_COMMAND,
  GIT_FIELD_SEPARATOR,
  GIT_LOG_ARGUMENTS,
  GIT_RECORD_SEPARATOR,
  UNREADABLE_REVISION_PREFIX,
} from "./constants.ts";

export type ResolveAppRevisionInput = {
  runProcess: RunProcess;
  environment: Record<string, string | undefined>;
  /** The build instant, which makes the fallback value unique. */
  deployInstant: string;
};

function findNewestUnmarkedCommit(gitLogOutput: string): string | undefined {
  for (const record of gitLogOutput.split(GIT_RECORD_SEPARATOR)) {
    const [hash, ...trailerFields] = record.trim().split(GIT_FIELD_SEPARATOR);
    const isMarked = trailerFields
      .join(GIT_FIELD_SEPARATOR)
      .split("\n")
      .some((trailerLine) => trailerLine.trim() === DATA_ONLY_TRAILER);
    if (hash && !isMarked) return hash;
  }
  return undefined;
}

async function readGitLog(runProcess: RunProcess): Promise<string> {
  try {
    const { exitCode, stdout } = await runProcess(
      GIT_COMMAND,
      GIT_LOG_ARGUMENTS,
    );
    return exitCode === 0 ? stdout : "";
  } catch {
    return "";
  }
}

export async function resolveAppRevision({
  runProcess,
  environment,
  deployInstant,
}: ResolveAppRevisionInput): Promise<string> {
  const explicitRevision = environment[APP_REVISION_ENVIRONMENT_KEY];
  if (explicitRevision) return explicitRevision;
  const newestCommit = findNewestUnmarkedCommit(await readGitLog(runProcess));
  return newestCommit ?? `${UNREADABLE_REVISION_PREFIX}${deployInstant}`;
}
