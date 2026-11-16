// Verifies FR5, FR6 of refresh-data-through-scheduled-pull-requests: data-only commits and paths.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  findPathsOutsideData,
  findSourceOfBranch,
} from "../../../../../scripts/dataRefresh/checkDataOnlyPaths.ts";
import {
  CLDR_PACKAGE_NAMES,
  CLIENT_MANIFEST_PATH,
  DATA_PATHS,
  LOCKFILE_PATH,
  REFRESH_SOURCES,
  REFRESH_VERDICTS,
  type RefreshSource,
} from "../../../../../scripts/dataRefresh/refreshConstants.ts";
import {
  appendDataOnlyTrailer,
  buildMergeSubject,
  buildRefreshPullRequest,
} from "../../../../../scripts/dataRefresh/refreshPullRequest.ts";

const feature = await loadFeature("../data_refresh_data_only_commits.feature");

const MERGE_DECISION = { verdict: REFRESH_VERDICTS.MERGE, reasons: [] };
const TRAILER_KEY = "Data-Only";
const FAILURE_PREFIX = "fails";

type CommitMessage = { subject: string; body: string };

const lastLineOf = (text: string) => text.split("\n").at(-1);

function buildManifestDiffFor(path: string): string | undefined {
  return path.startsWith('"')
    ? `+    ${path}`
    : undefined;
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let commit: CommitMessage;
  let offenders: string[];

  const mergeRefresh = (title: string, number: number) => {
    const source = title.startsWith("Update zone rules")
      ? REFRESH_SOURCES.ZONE_RULES
      : REFRESH_SOURCES.CITY_DATA;
    const name = title.split(" ").at(-1) ?? "";
    const pullRequest = buildRefreshPullRequest(source, name, MERGE_DECISION);
    expect(pullRequest.title).toBe(title);
    commit = { subject: pullRequest.mergeSubject(number), body: pullRequest.mergeBody };
  };

  // @refresh-data-through-scheduled-pull-requests @FR5
  f.Scenario("The commit of a zone rules refresh", ({ When, Then, And }) => {
    When("the pull request {string} with the number {int} merges", (_ctx, title: string, number: number) => {
      mergeRefresh(title, number);
    });
    Then("the commit on main has the subject {string}", (_ctx, subject: string) => {
      expect(commit.subject).toBe(subject);
    });
    And("the last line of its message is {string}", (_ctx, line: string) => {
      expect(lastLineOf(commit.body)).toBe(line);
    });
  });

  // @refresh-data-through-scheduled-pull-requests @FR5
  f.Scenario("The commit of a city data refresh", ({ When, Then }) => {
    When("the pull request {string} merges", (_ctx, title: string) => {
      mergeRefresh(title, 1);
    });
    Then("the last line of the commit's message on main is {string}", (_ctx, line: string) => {
      expect(lastLineOf(commit.body)).toBe(line);
    });
  });

  // @refresh-data-through-scheduled-pull-requests @FR5
  f.Scenario("The commit of a CLDR update", ({ When, Then, And }) => {
    let botTitle = "";
    When("the CLDR pull request {string} of the dependency bot with the number {int} merges", (_ctx, title: string, number: number) => {
      botTitle = title;
      commit = {
        subject: buildMergeSubject(title, number),
        body: appendDataOnlyTrailer(title),
      };
    });
    Then("the subject of the commit on main is the dependency bot's title followed by {string}", (_ctx, suffix: string) => {
      expect(commit.subject).toBe(`${botTitle} ${suffix}`);
    });
    And("the last line of its message is {string}", (_ctx, line: string) => {
      expect(lastLineOf(commit.body)).toBe(line);
    });
  });

  // @refresh-data-through-scheduled-pull-requests @FR6
  f.Scenario("Data paths of each source", ({ When, Then }) => {
    When("the data paths of a source are named", () => {});
    Then(
      "they are the zone rules directory for the zone rules, the city data directory for the city data, and the two CLDR version entries of the client package manifest with the lockfile for CLDR",
      () => {
        expect(DATA_PATHS).toEqual({
          "zone-rules": ["packages/client/zone-rules/"],
          "city-data": ["packages/client/city-data/"],
          cldr: [CLIENT_MANIFEST_PATH, LOCKFILE_PATH],
        });
        expect(CLDR_PACKAGE_NAMES).toEqual(["cldr-bcp47", "cldr-dates-full"]);
      },
    );
  });

  // @refresh-data-through-scheduled-pull-requests @FR6
  f.ScenarioOutline("A data refresh branch with other changes", ({ Given, When, Then }, variables) => {
    Given('a pull request on the data refresh branch of "<source>" that changes "<path>"', () => {});
    When("the pull request checks run", () => {
      const path = String(variables.path);
      const manifestDiff = buildManifestDiffFor(path);
      const changedPaths = manifestDiff === undefined ? [path] : [CLIENT_MANIFEST_PATH];
      offenders = findPathsOutsideData(variables.source as RefreshSource, changedPaths, manifestDiff);
    });
    Then('the data-only check "<outcome>"', () => {
      const outcome = String(variables.outcome);
      if (outcome.startsWith(FAILURE_PREFIX)) {
        expect(offenders).toEqual([String(variables.path)]);
      } else {
        expect(offenders).toEqual([]);
      }
    });
  });

  // @refresh-data-through-scheduled-pull-requests @FR5
  f.Scenario("An ordinary pull request", ({ When, Then }) => {
    let branchName = "";
    When("a pull request on the branch {string} is merged", (_ctx, branch: string) => {
      branchName = branch;
    });
    Then("the automation added no {string} trailer to its commit", (_ctx, trailerKey: string) => {
      expect(trailerKey).toBe(TRAILER_KEY);
      expect(findSourceOfBranch(branchName)).toBeUndefined();
    });
  });
});
