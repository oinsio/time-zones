// Implements D6 of add-pr-preview-deploy: one owner of the CI workflow parsing in tests.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGE_ROOT = join(import.meta.dirname, "../..");
const CI_WORKFLOW_FILE = join(PACKAGE_ROOT, "../../.github/workflows/ci.yml");
const JOBS_SECTION_MARKER = "\njobs:\n";
const JOB_KEY_PATTERN = /^ {2}([\w-]+):\s*$/;

function splitJobBlocks(workflowText: string): Map<string, string> {
  const jobsStart = workflowText.indexOf(JOBS_SECTION_MARKER);
  const jobsSection = workflowText.slice(
    jobsStart + JOBS_SECTION_MARKER.length,
  );
  const jobBlocks = new Map<string, string>();
  let currentJobName: string | undefined;
  for (const line of jobsSection.split("\n")) {
    const jobKeyMatch = JOB_KEY_PATTERN.exec(line);
    if (jobKeyMatch) {
      currentJobName = jobKeyMatch[1];
      jobBlocks.set(currentJobName, "");
    } else if (currentJobName !== undefined) {
      jobBlocks.set(
        currentJobName,
        `${jobBlocks.get(currentJobName)}${line}\n`,
      );
    }
  }
  return jobBlocks;
}

/**
 * Reads `.github/workflows/ci.yml` and splits its `jobs:` section into
 * job key → job block text (the lines under the key). Shared by the
 * `ciBenchmarkJob` and preview job tests (D6 of add-pr-preview-deploy).
 */
export function readCiJobBlocks(): Map<string, string> {
  return splitJobBlocks(readFileSync(CI_WORKFLOW_FILE, "utf8"));
}
