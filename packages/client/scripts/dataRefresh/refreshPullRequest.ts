/**
 * The data refresh pull request of a source: its branch, title, text and the
 * message of its squash commit, which ends with the data-only trailer.
 * Implements FR3, FR5 of refresh-data-through-scheduled-pull-requests (D3, D4, D5).
 */
import {
  DATA_ONLY_TRAILER,
  NEEDS_REVIEW_LABEL,
  REFRESH_BRANCHES,
  REFRESH_SOURCES,
  REFRESH_VERDICTS,
} from "./refreshConstants.ts";
import type { RefreshDecision } from "./refreshVerdict.ts";

export type PullRequestSource =
  | typeof REFRESH_SOURCES.ZONE_RULES
  | typeof REFRESH_SOURCES.CITY_DATA;

export type RefreshPullRequest = {
  branch: string;
  title: string;
  body: string;
  /** The squash commit's subject once the pull request has a number. */
  mergeSubject: (pullRequestNumber: number) => string;
  /** The squash commit's message body; its last line is the trailer. */
  mergeBody: string;
};

const PARAGRAPH_SEPARATOR = "\n\n";

/** `text` followed by the data-only trailer as the last line. */
export function appendDataOnlyTrailer(text: string): string {
  return `${text}${PARAGRAPH_SEPARATOR}${DATA_ONLY_TRAILER}`;
}

/** The squash commit subject: the pull request title and its number. */
export function buildMergeSubject(
  title: string,
  pullRequestNumber: number,
): string {
  return `${title} (#${pullRequestNumber})`;
}

function buildTitle(source: PullRequestSource, name: string): string {
  return source === REFRESH_SOURCES.ZONE_RULES
    ? `Update zone rules to ${name}`
    : `Refresh city data to the dump of ${name}`;
}

function buildDescription(
  source: PullRequestSource,
  decision: RefreshDecision,
): string {
  const sourceLabel =
    source === REFRESH_SOURCES.ZONE_RULES ? "zone rules" : "city data";
  const lines = [
    `Data refresh of the ${sourceLabel}, compiled by the scheduled workflow.`,
  ];
  if (decision.verdict === REFRESH_VERDICTS.NEEDS_REVIEW) {
    lines.push(
      `Automatic merging is withheld (label \`${NEEDS_REVIEW_LABEL}\`). Reasons:`,
      ...decision.reasons.map((reason) => `- ${reason}`),
    );
  }
  return lines.join("\n");
}

/** `name` is the release for the zone rules and the dump date for the city data. */
export function buildRefreshPullRequest(
  source: PullRequestSource,
  name: string,
  decision: RefreshDecision,
): RefreshPullRequest {
  const title = buildTitle(source, name);
  const description = buildDescription(source, decision);
  return {
    branch: REFRESH_BRANCHES[source],
    title,
    body: appendDataOnlyTrailer(description),
    mergeSubject: (pullRequestNumber) =>
      buildMergeSubject(title, pullRequestNumber),
    mergeBody: appendDataOnlyTrailer(description),
  };
}
