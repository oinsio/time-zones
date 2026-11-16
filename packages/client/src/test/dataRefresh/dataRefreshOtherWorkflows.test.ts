// Verifies FR5, FR9, FR10, FR11, NFR-S1, NG5 of refresh-data-through-scheduled-pull-requests.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CLDR_BRANCH_PREFIX } from "../../../scripts/dataRefresh/refreshConstants.ts";
import { readCiJobBlocks } from "../ciWorkflow.ts";
import {
  GITHUB_DIRECTORY,
  permissionLines,
  readWorkflow,
  SWITCH_CONDITION,
  stepNamed,
  WORKFLOWS_DIRECTORY,
} from "./workflowFiles.ts";

const REFRESH_WORKFLOW_FILES = [
  "zone-rules-publication.yml",
  "city-data-refresh.yml",
];

describe("cldr-update.yml", () => {
  const workflow = readWorkflow("cldr-update.yml");
  const autoMergeStep = stepNamed(
    workflow,
    "Enable auto-merge as a data-only commit",
  );

  it("enables auto-merge only on the branch of the CLDR group, with the switch on", () => {
    expect(workflow).toContain(
      `startsWith(github.head_ref, '${CLDR_BRANCH_PREFIX}')`,
    );
    expect(workflow).toContain(SWITCH_CONDITION);
  });

  it("keeps the dependency bot's title in the subject", () => {
    expect(autoMergeStep).toContain(
      '--subject "$PULL_REQUEST_TITLE (#$PULL_REQUEST_NUMBER)"',
    );
  });

  it("ends the commit message with the trailer", () => {
    expect(autoMergeStep).toMatch(/Data-Only: true'\)"/);
  });

  it("labels the pull request and reports a failed check in the issue of CLDR", () => {
    expect(workflow).toContain(
      'gh pr edit "$PULL_REQUEST_NUMBER" --add-label needs-review',
    );
    expect(workflow).toContain("data-refresh:issue cldr");
    expect(workflow).toContain("gh issue close");
  });

  it("asks the bot token for contents and pull requests at most", () => {
    const allowed = [
      "permission-contents: write",
      "permission-pull-requests: write",
    ];
    for (const line of permissionLines(workflow)) {
      expect(allowed).toContain(line.trim());
    }
  });
});

describe("dependabot.yml", () => {
  const dependabot = readFileSync(
    join(GITHUB_DIRECTORY, "dependabot.yml"),
    "utf8",
  );

  it("allows only the two CLDR packages, monthly and in one group", () => {
    expect(dependabot.match(/dependency-name: [\w-]+/g)).toEqual([
      "dependency-name: cldr-bcp47",
      "dependency-name: cldr-dates-full",
    ]);
    expect(dependabot).toContain("interval: monthly");
    expect(dependabot).toMatch(/groups:\n\s+cldr:/);
  });
});

describe("secrets", () => {
  const workflowFiles = readdirSync(WORKFLOWS_DIRECTORY).filter((fileName) =>
    fileName.endsWith(".yml"),
  );

  const dataRefreshFiles = [...REFRESH_WORKFLOW_FILES, "cldr-update.yml"];

  it.each(dataRefreshFiles)("%s prints no secret", (fileName) => {
    const workflow = readWorkflow(fileName);
    const runBlocks =
      workflow.match(/run: [\s\S]*?(?=\n {6}- |\n {4}\w|$)/g) ?? [];
    expect(runBlocks.filter((block) => block.includes("secrets."))).toEqual([]);
  });

  it.each(workflowFiles)(
    "%s does not use pull_request_target together with the bot's secrets",
    (fileName) => {
      const workflow = readWorkflow(fileName);
      expect(
        workflow.includes("pull_request_target") &&
          workflow.includes("DATA_REFRESH_APP"),
      ).toBe(false);
    },
  );

  it("gives the bot's secrets to the token steps only", () => {
    for (const fileName of workflowFiles) {
      const lines = readWorkflow(fileName)
        .split("\n")
        .filter((line) => line.includes("secrets.DATA_REFRESH"));
      for (const line of lines) {
        expect(line).toMatch(
          /^\s+(app-id|private-key): \$\{\{ secrets\.DATA_REFRESH_APP_(ID|PRIVATE_KEY) \}\}$/,
        );
      }
    }
  });
});

describe("ci.yml", () => {
  it("checks the data-only paths in the main job", () => {
    const block = readCiJobBlocks().get("check") ?? "";
    expect(block).toContain("name: Check data-only paths");
    expect(block).toContain("data-refresh:check-paths auto origin/main HEAD");
  });
});
