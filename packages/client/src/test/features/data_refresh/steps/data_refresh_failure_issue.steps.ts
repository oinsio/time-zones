// Verifies FR8, UX1 of refresh-data-through-scheduled-pull-requests: the failure issue.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { REFRESH_SOURCES } from "../../../../../scripts/dataRefresh/refreshConstants.ts";
import {
  buildRefreshFailureIssue,
  buildRefreshRecoveryComment,
} from "../../../../../scripts/dataRefresh/refreshFailureIssue.ts";

const feature = await loadFeature("../data_refresh_failure_issue.feature");

const RUN_URL = "https://github.com/example/time-zones/actions/runs/42";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  // @refresh-data-through-scheduled-pull-requests @FR8
  f.Scenario("The first failure", ({ Given, When, Then }) => {
    let issue: ReturnType<typeof buildRefreshFailureIssue>;
    Given("no issue of the zone rules refresh is open", () => {});
    When("the zone rules publication fails at the step {string}", (_ctx, step: string) => {
      issue = buildRefreshFailureIssue(REFRESH_SOURCES.ZONE_RULES, step, RUN_URL);
    });
    Then("an issue {string} is opened that names the step and links the run", (_ctx, title: string) => {
      expect(issue.title).toBe(title);
      expect(issue.body).toContain("Compile the release");
      expect(issue.body).toContain(RUN_URL);
    });
  });

  // @refresh-data-through-scheduled-pull-requests @FR8
  f.Scenario("Recovery", ({ Given, When, Then }) => {
    let comment = "";
    Given("the issue {string} is open", (_ctx, title: string) => {
      expect(buildRefreshFailureIssue(REFRESH_SOURCES.ZONE_RULES, "any", RUN_URL).title).toBe(title);
    });
    When("the zone rules publication succeeds reporting {string}", () => {
      comment = buildRefreshRecoveryComment(RUN_URL);
    });
    Then("the issue is closed with a comment linking the run", () => {
      expect(comment).toContain(RUN_URL);
    });
  });
});
