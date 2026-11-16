// Shared readers of the workflow files; implements FR10, FR11 of refresh-data-through-scheduled-pull-requests.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const GITHUB_DIRECTORY = join(
  import.meta.dirname,
  "../../../../../.github",
);
export const WORKFLOWS_DIRECTORY = join(GITHUB_DIRECTORY, "workflows");
export const readWorkflow = (fileName: string) =>
  readFileSync(join(WORKFLOWS_DIRECTORY, fileName), "utf8");

export const SWITCH_CONDITION = "vars.DATA_REFRESH_ENABLED == 'true'";
const STEP_SEPARATOR = /\n {6}- /;

export const splitSteps = (workflowText: string) =>
  workflowText.split(STEP_SEPARATOR).slice(1);
export const stepNamed = (workflowText: string, name: string) => {
  const step = splitSteps(workflowText).find((text) =>
    text.startsWith(`name: ${name}`),
  );
  if (step === undefined) throw new Error(`no step named ${name}`);
  return step;
};
export const permissionLines = (text: string) =>
  text.split("\n").filter((line) => /^\s+permission-[\w-]+:/.test(line));
