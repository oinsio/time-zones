// Shape of the `preview` job of ci.yml and of the build hand-over from `check`.
// Verifies FR1, FR2, FR4–FR7, NFR-P1 of add-pr-preview-deploy (D1, D2, D4, D5, D6).
import { describe, expect, it } from "vitest";
import { readCiJobBlocks } from "../ciWorkflow";

const PREVIEW_JOB = "preview";
const CHECK_JOB = "check";
const PREVIEW_SECRET_NAMES = ["NETLIFY_AUTH_TOKEN", "NETLIFY_SITE_ID"];
const PREVIEW_ARTIFACT_NAME = "preview-build";
const STEPS_SECTION_MARKER = /^ {4}steps:\s*$/m;
const STEP_START_PATTERN = /^ {6}- /;
const JOB_IF_PATTERN = /^ {4}if:([\s\S]*?)(?=^ {4}\S|(?![\s\S]))/m;

const NEEDS_CHECK = /^ {4}needs:\s*(?:check|\[\s*check\s*\])\s*$/m;
const PULL_REQUEST_EVENT_CONDITION = /github\.event_name\s*==\s*'pull_request'/;
const SAME_REPOSITORY_CONDITION =
  /github\.event\.pull_request\.head\.repo\.full_name\s*==\s*github\.repository/;
const NOT_DEPENDABOT_CONDITION = /github\.actor\s*!=\s*'dependabot\[bot\]'/;
const PER_PR_CONCURRENCY_GROUP =
  /^ {6}group:\s*["']?preview-\$\{\{\s*github\.event\.pull_request\.number\s*\}\}["']?\s*$/m;
const CANCEL_IN_PROGRESS = /^ {6}cancel-in-progress:\s*true\s*$/m;
const TEN_MINUTE_TIMEOUT = /^ {4}timeout-minutes:\s*10\s*$/m;
const PULL_REQUESTS_WRITE_PERMISSION = /^ {6}pull-requests:\s*write\s*$/m;
const PREVIEW_SECRETS_STEP_ID = /^\s+id:\s*["']?preview-secrets["']?\s*$/m;
const AVAILABLE_OUTPUT = /available=[\s\S]*\$\{?GITHUB_OUTPUT\}?/;
const PREVIEW_SECRETS_GUARD =
  /^\s+if:\s*(?:\$\{\{\s*)?steps\.preview-secrets\.outputs\.available\s*==\s*'true'\s*(?:\}\})?\s*$/m;
const NETLIFY_ACTION = /^\s+(?:- )?uses:\s*nwtgck\/actions-netlify@v3\s*$/m;
const NETLIFY_INPUTS = [
  /^\s+production-deploy:\s*false\s*$/m,
  /^\s+enable-pull-request-comment:\s*true\s*$/m,
  /^\s+overwrites-pull-request-comment:\s*true\s*$/m,
  /^\s+enable-commit-comment:\s*false\s*$/m,
  /^\s+enable-github-deployment:\s*false\s*$/m,
];
const ALIAS_INPUT = /^\s+alias:/m;
const ASSEMBLE_SCRIPT = "assemble-preview-site.mjs";
const SETUP_NODE_ACTION = /^\s+(?:- )?uses:\s*actions\/setup-node@v5\s*$/m;
const NO_PACKAGE_MANAGER_CACHE = /^\s+package-manager-cache:\s*false\s*$/m;
const DOWNLOAD_ARTIFACT_ACTION =
  /^\s+(?:- )?uses:\s*actions\/download-artifact@v4\s*$/m;
const UPLOAD_ARTIFACT_ACTION =
  /^\s+(?:- )?uses:\s*actions\/upload-artifact@v4\s*$/m;
const PREVIEW_ARTIFACT_INPUT = /^\s+name:\s*["']?preview-build["']?\s*$/m;
const DIST_PATH_INPUT = /^\s+path:\s*packages\/client\/dist\s*$/m;
const ONE_DAY_RETENTION = /^\s+retention-days:\s*1\s*$/m;
const PULL_REQUEST_STEP_GUARD =
  /^\s+if:\s*github\.event_name\s*==\s*'pull_request'\s*$/m;
const SMOKE_E2E_COMMAND = "test:bdd";
const INSTALL_OR_BUILD_COMMAND = /\bpnpm\s+(?:install|i|build|run\s+build)\b/;
const NEEDS_PREVIEW =
  /^\s+needs:\s*(?:\[[^\]\n]*(?<![\w-])preview(?![\w-])[^\]\n]*\]|preview)\s*$|^\s+needs:\s*\n(?:\s+- .*\n)*?\s+- preview\s*$/m;

/** Splits a job block's `steps:` section into one text block per step. */
function splitStepBlocks(jobBlock: string): string[] {
  const stepsMarker = STEPS_SECTION_MARKER.exec(jobBlock);
  if (!stepsMarker) return [];
  const stepsSection = jobBlock.slice(
    stepsMarker.index + stepsMarker[0].length,
  );
  const stepBlocks: string[] = [];
  for (const line of stepsSection.split("\n")) {
    if (STEP_START_PATTERN.test(line)) stepBlocks.push(`${line}\n`);
    else if (stepBlocks.length > 0)
      stepBlocks[stepBlocks.length - 1] += `${line}\n`;
  }
  return stepBlocks;
}

function findStepIndex(stepBlocks: string[], stepPattern: RegExp): number {
  return stepBlocks.findIndex((stepBlock) => stepPattern.test(stepBlock));
}

const jobBlocks = readCiJobBlocks();
const previewJob = jobBlocks.get(PREVIEW_JOB) ?? "";
const previewSteps = splitStepBlocks(previewJob);
const checkSteps = splitStepBlocks(jobBlocks.get(CHECK_JOB) ?? "");
const previewJobCondition = JOB_IF_PATTERN.exec(previewJob)?.[1] ?? "";
const secretsStepIndex = findStepIndex(previewSteps, PREVIEW_SECRETS_STEP_ID);
const secretsStep = previewSteps[secretsStepIndex] ?? "";
const netlifyStep =
  previewSteps[findStepIndex(previewSteps, NETLIFY_ACTION)] ?? "";

describe("CI preview job", () => {
  // FR1, FR6: published only after the PR check passed, of add-pr-preview-deploy
  it("should define a preview job that needs the check job", () => {
    expect(previewJob).toMatch(NEEDS_CHECK);
  });

  // FR6, FR7: pull requests of this repository only, no Dependabot, of add-pr-preview-deploy
  it.each([
    ["a pull request event", PULL_REQUEST_EVENT_CONDITION],
    ["the same repository", SAME_REPOSITORY_CONDITION],
    ["a non-Dependabot actor", NOT_DEPENDABOT_CONDITION],
  ])("should run only for %s", (_, conditionPattern) => {
    expect(previewJobCondition).toMatch(conditionPattern);
  });

  // FR5: per-PR concurrency with cancel; NFR-P1: 10-minute timeout;
  // FR4: may write the PR comment — all of add-pr-preview-deploy
  it.each([
    ["a concurrency group per pull request number", PER_PR_CONCURRENCY_GROUP],
    ["cancel-in-progress", CANCEL_IN_PROGRESS],
    ["a 10-minute timeout", TEN_MINUTE_TIMEOUT],
    ["pull-requests: write permission", PULL_REQUESTS_WRITE_PERMISSION],
  ])("should have %s", (_, jobPattern) => {
    expect(previewJob).toMatch(jobPattern);
  });

  // FR6: missing secrets end the job with a notice, of add-pr-preview-deploy
  it.each([
    ["write the availability output", AVAILABLE_OUTPUT],
    ...PREVIEW_SECRET_NAMES.map((secretName) => [
      `print a notice naming ${secretName}`,
      new RegExp(`::notice::.*${secretName}`),
    ]),
  ] as [string, RegExp][])(
    "should check the secrets and %s",
    (_, secretsStepPattern) => {
      expect(secretsStep).toMatch(secretsStepPattern);
    },
  );

  // FR6: no deploy step runs without the secrets, of add-pr-preview-deploy
  it("should guard every step after the secrets check", () => {
    const stepsAfterSecretsCheck = previewSteps.slice(secretsStepIndex + 1);
    expect(secretsStepIndex).toBeGreaterThan(-1);
    expect(stepsAfterSecretsCheck.length).toBeGreaterThan(0);
    expect(
      stepsAfterSecretsCheck.filter(
        (stepBlock) => !PREVIEW_SECRETS_GUARD.test(stepBlock),
      ),
    ).toEqual([]);
  });

  // FR1, FR4: a draft Netlify deploy with one updated PR comment, of add-pr-preview-deploy
  it.each(NETLIFY_INPUTS)(
    "should deploy with nwtgck/actions-netlify@v3 and input %s",
    (inputPattern) => {
      expect(netlifyStep).toMatch(inputPattern);
    },
  );

  // FR1, NG5: every push gets its own unique address, of add-pr-preview-deploy
  it("should deploy without a stable alias", () => {
    expect(netlifyStep).toMatch(NETLIFY_ACTION);
    expect(netlifyStep).not.toMatch(ALIAS_INPUT);
  });

  // FR2: the tested build is downloaded and assembled, not rebuilt, of add-pr-preview-deploy
  it("should assemble the downloaded build without installing or building", () => {
    const downloadStep =
      previewSteps[findStepIndex(previewSteps, DOWNLOAD_ARTIFACT_ACTION)] ?? "";
    expect(downloadStep).toMatch(PREVIEW_ARTIFACT_INPUT);
    expect(previewJob).toContain(ASSEMBLE_SCRIPT);
    expect(previewJob).not.toMatch(INSTALL_OR_BUILD_COMMAND);
  });

  // FR2: setup-node must not look for pnpm, which this job never installs, of add-pr-preview-deploy
  it("should set up Node without the package manager cache", () => {
    const setupNodeStep =
      previewSteps[findStepIndex(previewSteps, SETUP_NODE_ACTION)] ?? "";
    expect(setupNodeStep).toMatch(NO_PACKAGE_MANAGER_CACHE);
  });

  // FR7: nothing waits for the preview job, of add-pr-preview-deploy
  it("should be needed by no other job", () => {
    const jobsNeedingPreview = [...jobBlocks]
      .filter(([, jobBlock]) => NEEDS_PREVIEW.test(jobBlock))
      .map(([jobName]) => jobName);
    expect(jobsNeedingPreview).toEqual([]);
  });
});

describe("CI check job hand-over of the preview build", () => {
  const previewUploadIndex = checkSteps.findIndex(
    (stepBlock) =>
      UPLOAD_ARTIFACT_ACTION.test(stepBlock) &&
      PREVIEW_ARTIFACT_INPUT.test(stepBlock),
  );
  const previewUploadStep = checkSteps[previewUploadIndex] ?? "";

  // FR2, NFR-P1: one artifact upload of dist on pull requests, of add-pr-preview-deploy
  it.each([
    ["a pull_request guard", PULL_REQUEST_STEP_GUARD],
    ["the dist path", DIST_PATH_INPUT],
    ["a one-day retention", ONE_DAY_RETENTION],
  ])("should upload the preview build with %s", (_, stepPattern) => {
    expect(previewUploadStep).toMatch(stepPattern);
  });

  // FR2, NFR-P1: the uploaded build is the one the smoke E2E tested, of add-pr-preview-deploy
  it("should upload the preview build after the smoke E2E", () => {
    const smokeE2eIndex = checkSteps.findIndex((stepBlock) =>
      stepBlock.includes(SMOKE_E2E_COMMAND),
    );
    expect(smokeE2eIndex).toBeGreaterThan(-1);
    expect(previewUploadIndex).toBeGreaterThan(smokeE2eIndex);
  });

  // NFR-P1: the only new step of check is one upload, of add-pr-preview-deploy
  it("should upload the preview build exactly once", () => {
    expect(
      checkSteps.filter((stepBlock) =>
        stepBlock.includes(PREVIEW_ARTIFACT_NAME),
      ),
    ).toHaveLength(1);
  });
});
