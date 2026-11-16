// Verifies FR8, UX1 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import {
  buildRefreshFailureIssue,
  buildRefreshRecoveryComment,
} from "../../../scripts/dataRefresh/refreshFailureIssue.ts";

const RUN_URL = "https://github.com/example/repo/actions/runs/1";

describe("buildRefreshFailureIssue", () => {
  it.each([
    ["zone-rules", "Data refresh failed: zone rules"],
    ["city-data", "Data refresh failed: city data"],
    ["cldr", "Data refresh failed: CLDR"],
  ] as const)("titles the issue of %s", (source, title) => {
    expect(
      buildRefreshFailureIssue(source, "Compile the release", RUN_URL).title,
    ).toBe(title);
  });

  it("names the failed step and links the run", () => {
    expect(
      buildRefreshFailureIssue("zone-rules", "Compile the release", RUN_URL)
        .body,
    ).toBe(`Failed step: Compile the release\nRun: ${RUN_URL}`);
  });

  it("names the failed check and links the pull request for CLDR", () => {
    expect(
      buildRefreshFailureIssue("cldr", "Lint, test, build, E2E", RUN_URL).body,
    ).toBe(`Failed check: Lint, test, build, E2E\nPull request: ${RUN_URL}`);
  });
});

describe("buildRefreshRecoveryComment", () => {
  it("links the successful run", () => {
    expect(buildRefreshRecoveryComment(RUN_URL)).toContain(RUN_URL);
  });
});
