// Implements FR7 of add-zone-rules-from-iana: runs the compile CLI flow over the fakes of task 4.4.
import { readFileSync } from "node:fs";
import { runZoneRulesCompile } from "../../../scripts/zoneRules/compile.ts";
import {
  createFakeFetch,
  createFakeProcessRunner,
  type FakeScenario,
  VALID_VERIFY_STATUS_FILE,
} from "./compileFakes";

export const RELEASE = "2026f";
export const VALID_STATUS = readFileSync(VALID_VERIFY_STATUS_FILE, "utf8");
export const VALID_SCENARIO: FakeScenario = {
  verifyStatus: VALID_STATUS,
  archiveVersion: RELEASE,
};

export type CompileRun = Awaited<ReturnType<typeof compile>>;

export async function compile(
  scenario: FakeScenario,
  argv: string[] = [RELEASE],
) {
  const processes = createFakeProcessRunner(scenario);
  const downloads = createFakeFetch();
  const writtenFiles = new Map<string, string>();
  const logLines: string[] = [];
  const exitCode = await runZoneRulesCompile({
    argv,
    runProcess: processes.runProcess,
    fetchRelease: downloads.fetchRelease,
    writeFile: async (path, text) => void writtenFiles.set(path, text),
    log: (line) => logLines.push(line),
  });
  return {
    exitCode,
    writtenFiles,
    logLines,
    calls: processes.calls,
    urls: downloads.urls,
  };
}

export function logsMention(run: CompileRun, text: string): boolean {
  return run.logLines.some((line) => line.includes(text));
}
