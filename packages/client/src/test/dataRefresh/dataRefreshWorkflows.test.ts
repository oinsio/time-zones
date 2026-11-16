// Verifies FR1, FR3, FR4, FR6, FR8, FR10, FR11, NFR-P1, NFR-S1 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import {
  NEEDS_REVIEW_LABEL,
  REFRESH_BRANCHES,
  REFRESH_FAILURE_LABEL,
  REFRESH_SOURCES,
} from "../../../scripts/dataRefresh/refreshConstants.ts";
import {
  permissionLines,
  readWorkflow,
  SWITCH_CONDITION,
  splitSteps,
  stepNamed,
} from "./workflowFiles.ts";

const SWITCH_REPORT_STEP = "Report the data refresh switch";
const PULL_REQUEST_STEP = "Open or update the data refresh pull request";
const TOKEN_STEP = "Create the data refresh bot token";
const REFRESH_WORKFLOWS = [
  ["zone-rules-publication.yml", '"17 4 * * *"', REFRESH_SOURCES.ZONE_RULES],
  ["city-data-refresh.yml", '"43 5 2 * *"', REFRESH_SOURCES.CITY_DATA],
] as const;

describe.each(REFRESH_WORKFLOWS)("%s", (fileName, cron, source) => {
  const workflow = readWorkflow(fileName);

  it("runs on its schedule and on manual dispatch", () => {
    expect(workflow).toContain(`- cron: ${cron}`);
    expect(workflow).toContain("workflow_dispatch:");
  });

  it("acts only on main, within 20 minutes", () => {
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'");
    expect(workflow).toContain("timeout-minutes: 20");
  });

  it("conditions every step but the report on the switch", () => {
    const unconditioned = splitSteps(workflow).filter(
      (step) =>
        !step.startsWith(`name: ${SWITCH_REPORT_STEP}`) &&
        !step.includes(SWITCH_CONDITION),
    );
    expect(unconditioned).toEqual([]);
  });

  it("reports the switch being off", () => {
    expect(stepNamed(workflow, SWITCH_REPORT_STEP)).toContain(
      "vars.DATA_REFRESH_ENABLED != 'true'",
    );
  });

  it("never pushes to main", () => {
    expect(workflow).not.toMatch(/git push[^\n]*\bmain\b/);
    expect(workflow).toContain('git push --force origin "$BRANCH"');
  });

  it("holds read access at the top and only issues and actions writes in the job", () => {
    expect(workflow).toMatch(/^permissions:\n {2}contents: read\n/m);
    expect(workflow).toMatch(
      / {4}permissions:\n {6}contents: read\n {6}issues: write\n {6}actions: write\n/,
    );
  });

  it("asks the bot token for contents and pull requests only", () => {
    expect(
      permissionLines(stepNamed(workflow, TOKEN_STEP)).map((line) =>
        line.trim(),
      ),
    ).toEqual([
      "permission-contents: write",
      "permission-pull-requests: write",
    ]);
  });

  it("sets up the checkout before the bot token, which a broken App must not block", () => {
    const stepNames = splitSteps(workflow).map((step) => step.split("\n")[0]);
    const checkoutIndex = stepNames.findIndex((line) =>
      line.includes("actions/checkout"),
    );
    const installIndex = stepNames.findIndex((line) =>
      line.includes("pnpm install"),
    );
    const tokenIndex = stepNames.indexOf(`name: ${TOKEN_STEP}`);
    expect(checkoutIndex).toBeGreaterThan(-1);
    expect(installIndex).toBeGreaterThan(checkoutIndex);
    expect(tokenIndex).toBeGreaterThan(installIndex);
    expect(splitSteps(workflow)[checkoutIndex]).toContain(
      "persist-credentials: false",
    );
  });

  it("pushes the refresh branch with the bot token", () => {
    expect(stepNamed(workflow, PULL_REQUEST_STEP)).toContain(
      'git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git"',
    );
  });

  it("refuses to report a failed refresh it could not describe", () => {
    expect(stepNamed(workflow, "Report the failed refresh")).toContain(
      'if [ -z "$ISSUE_TITLE" ]',
    );
  });

  it("names its branch and labels as the constants do", () => {
    expect(stepNamed(workflow, PULL_REQUEST_STEP)).toContain(
      `BRANCH: ${REFRESH_BRANCHES[source]}`,
    );
    const labelValues = [
      ...workflow.matchAll(/--(?:add|remove)-label ([\w-]+)/g),
    ].map((match) => match[1]);
    expect(labelValues.length).toBeGreaterThan(0);
    expect(new Set(labelValues)).toEqual(new Set([NEEDS_REVIEW_LABEL]));
    const issueLabels = [...workflow.matchAll(/--label ([\w-]+)/g)].map(
      (match) => match[1],
    );
    expect(issueLabels.length).toBeGreaterThan(0);
    expect(new Set(issueLabels)).toEqual(new Set([REFRESH_FAILURE_LABEL]));
  });

  it("serialises runs of its source without cancelling", () => {
    expect(workflow).toContain("cancel-in-progress: false");
  });

  it("uses the run's own token for the failure issue", () => {
    for (const name of [
      "Describe the failed refresh",
      "Report the failed refresh",
      "Close the issue of a failed refresh",
    ]) {
      expect(stepNamed(workflow, name)).toContain(
        "GH_TOKEN: ${{ github.token }}",
      );
    }
  });

  it("opens the pull request with the bot token and enables auto-merge only for a merge verdict", () => {
    const step = stepNamed(
      workflow,
      "Open or update the data refresh pull request",
    );
    expect(step).toContain("GH_TOKEN: ${{ steps.app-token.outputs.token }}");
    expect(step).toContain(
      'gh pr merge "$NUMBER" --auto --squash --subject "$TITLE (#$NUMBER)" --body-file "$MERGE_BODY_FILE"',
    );
    expect(step).toContain('if [ "$VERDICT" = "NEEDS_REVIEW" ]');
  });
});

describe("zone-rules-publication.yml", () => {
  const workflow = readWorkflow("zone-rules-publication.yml");

  it("enables both scheduled workflows with the run's own token", () => {
    const step = stepNamed(workflow, "Keep the scheduled workflows enabled");
    expect(step).toContain("gh workflow enable zone-rules-publication.yml");
    expect(step).toContain("gh workflow enable city-data-refresh.yml");
    expect(step).toContain("GH_TOKEN: ${{ github.token }}");
  });

  it("looks for a newer release even when renewing failed, then fails the run", () => {
    expect(
      stepNamed(workflow, "Keep the scheduled workflows enabled"),
    ).toContain("continue-on-error: true");
    expect(
      stepNamed(workflow, "Fail the run when renewing the schedules failed"),
    ).toContain("steps.renew.outcome == 'failure'");
  });

  it("opens no pull request when the release is current", () => {
    expect(stepNamed(workflow, "Compile the release")).toContain(
      "steps.latest.outputs.release != ''",
    );
  });
});
