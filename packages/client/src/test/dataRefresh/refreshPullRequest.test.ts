// Verifies FR3, FR5 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import {
  DATA_ONLY_TRAILER,
  REFRESH_VERDICTS,
} from "../../../scripts/dataRefresh/refreshConstants.ts";
import {
  appendDataOnlyTrailer,
  buildMergeSubject,
  buildRefreshPullRequest,
} from "../../../scripts/dataRefresh/refreshPullRequest.ts";

const mergeDecision = { verdict: REFRESH_VERDICTS.MERGE, reasons: [] };
const reviewDecision = {
  verdict: REFRESH_VERDICTS.NEEDS_REVIEW,
  reasons: ["The zone identifier Europe/Kyiv of the committed release is missing"],
};

describe("buildRefreshPullRequest", () => {
  it.each([
    ["zone-rules", "2026g", "data-refresh/zone-rules", "Update zone rules to 2026g"],
    ["city-data", "2026-12-02", "data-refresh/city-data", "Refresh city data to the dump of 2026-12-02"],
  ] as const)("names the branch and the title of %s", (source, name, branch, title) => {
    const pullRequest = buildRefreshPullRequest(source, name, mergeDecision);
    expect([pullRequest.branch, pullRequest.title]).toEqual([branch, title]);
  });

  it("lists the reasons of a needs-review verdict", () => {
    const { body } = buildRefreshPullRequest("zone-rules", "2026g", reviewDecision);
    expect(body).toContain("- The zone identifier Europe/Kyiv of the committed release is missing");
  });

  it("lists no reasons for a merge verdict", () => {
    const { body } = buildRefreshPullRequest("city-data", "2026-12-02", mergeDecision);
    expect(body).not.toContain("Reasons");
  });

  it.each([mergeDecision, reviewDecision])("ends the text with the trailer line", (decision) => {
    const { body } = buildRefreshPullRequest("zone-rules", "2026g", decision);
    expect(body.split("\n").at(-1)).toBe(DATA_ONLY_TRAILER);
  });

  it("ends the merge body with the trailer line", () => {
    const { mergeBody } = buildRefreshPullRequest("city-data", "2026-12-02", reviewDecision);
    expect(mergeBody.split("\n").at(-1)).toBe("Data-Only: true");
  });

  it("builds the merge subject from the title and the number", () => {
    const pullRequest = buildRefreshPullRequest("zone-rules", "2026g", mergeDecision);
    expect(pullRequest.mergeSubject(140)).toBe("Update zone rules to 2026g (#140)");
  });
});

describe("the text of the pull request", () => {
  it.each([
    ["zone-rules", "zone rules"],
    ["city-data", "city data"],
  ] as const)("describes the %s refresh", (source, label) => {
    const { body, mergeBody } = buildRefreshPullRequest(source, "x", mergeDecision);
    const expected = `Data refresh of the ${label}, compiled by the scheduled workflow.\n\nData-Only: true`;
    expect([body, mergeBody]).toEqual([expected, expected]);
  });

  it("states the label and each reason when the verdict needs review", () => {
    const { body } = buildRefreshPullRequest("zone-rules", "x", reviewDecision);
    expect(body).toBe(
      [
        "Data refresh of the zone rules, compiled by the scheduled workflow.",
        "Automatic merging is withheld (label `needs-review`). Reasons:",
        "- The zone identifier Europe/Kyiv of the committed release is missing",
        "",
        "Data-Only: true",
      ].join("\n"),
    );
  });
});

describe("the trailer helpers", () => {
  it("appends the trailer after a blank line", () => {
    expect(appendDataOnlyTrailer("Text")).toBe("Text\n\nData-Only: true");
  });

  it("keeps a dependency bot's title in the subject", () => {
    expect(buildMergeSubject("Bump cldr-bcp47 from 48.2.0 to 49.0.0", 150)).toBe(
      "Bump cldr-bcp47 from 48.2.0 to 49.0.0 (#150)",
    );
  });
});
