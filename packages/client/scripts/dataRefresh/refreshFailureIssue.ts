/**
 * The issue of a failed data refresh: one fixed title per source, a body naming
 * the failed step and linking the run, and the comment that closes it.
 * Implements FR8, UX1 of refresh-data-through-scheduled-pull-requests (D5, D8).
 */
import {
  REFRESH_SOURCE_NAMES,
  REFRESH_SOURCES,
  type RefreshSource,
} from "./refreshConstants.ts";

export type RefreshFailureIssue = { title: string; body: string };

/** `failedStep` is a step of the run; for CLDR it is the failed check. `url` links the run (CLDR: the pull request). */
export function buildRefreshFailureIssue(
  source: RefreshSource,
  failedStep: string,
  url: string,
): RefreshFailureIssue {
  const isCldr = source === REFRESH_SOURCES.CLDR;
  const failureLabel = isCldr ? "Failed check" : "Failed step";
  const linkLabel = isCldr ? "Pull request" : "Run";
  return {
    title: `Data refresh failed: ${REFRESH_SOURCE_NAMES[source]}`,
    body: `${failureLabel}: ${failedStep}\n${linkLabel}: ${url}`,
  };
}

/** The comment that closes the issue once a run of the source succeeded. */
export function buildRefreshRecoveryComment(url: string): string {
  return `The data refresh works again: ${url}`;
}
