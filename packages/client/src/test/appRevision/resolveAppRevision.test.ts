// Verifies FR1, NFR-P1, M2 of apply-data-updates-silently.
import { describe, expect, it, vi } from "vitest";
import {
  APP_REVISION_ENVIRONMENT_KEY,
  GIT_LOG_FORMAT,
  UNREADABLE_REVISION_PREFIX,
} from "../../../scripts/appRevision/constants.ts";
import { resolveAppRevision } from "../../../scripts/appRevision/resolveAppRevision.ts";
import { DATA_ONLY_TRAILER } from "../../../scripts/dataRefresh/refreshConstants.ts";
import type { RunProcess } from "../../../scripts/zoneRules/processTypes.ts";

const DEPLOY_INSTANT = "2026-11-17T10:00:00.000Z";
const RECORD_END = "\x1e";
const FIELD_SEPARATOR = "\0";

function commit(hash: string, trailers: string[] = []): string {
  return `${hash}${FIELD_SEPARATOR}${trailers.join("\n")}\n${RECORD_END}\n`;
}

function runnerWith(stdout: string, exitCode = 0): RunProcess {
  return vi.fn(async () => ({ exitCode, stdout, stderr: "" }));
}

function resolveWith(runProcess: RunProcess, environment = {}) {
  return resolveAppRevision({
    runProcess,
    environment,
    deployInstant: DEPLOY_INSTANT,
  });
}

describe("resolveAppRevision", () => {
  it("should return the explicit value of the environment without running git", async () => {
    const runProcess = runnerWith("");
    const revision = await resolveWith(runProcess, {
      [APP_REVISION_ENVIRONMENT_KEY]: "1.4.0",
    });
    expect(revision).toBe("1.4.0");
    expect(runProcess).not.toHaveBeenCalled();
  });

  it("should ignore an empty explicit value", async () => {
    const revision = await resolveWith(runnerWith(commit("aaa")), {
      [APP_REVISION_ENVIRONMENT_KEY]: "",
    });
    expect(revision).toBe("aaa");
  });

  it("should ask git for the log with the format of the constants", async () => {
    const runProcess = runnerWith(commit("aaa"));
    await resolveWith(runProcess);
    expect(runProcess).toHaveBeenCalledWith(
      "git",
      expect.arrayContaining([GIT_LOG_FORMAT]),
    );
  });

  it("should return the newest commit when it has no trailer", async () => {
    const revision = await resolveWith(
      runnerWith(commit("aaa") + commit("bbb")),
    );
    expect(revision).toBe("aaa");
  });

  it("should skip two data-only commits and return the next one", async () => {
    const marked = [DATA_ONLY_TRAILER];
    const revision = await resolveWith(
      runnerWith(commit("aaa", marked) + commit("bbb", marked) + commit("ccc")),
    );
    expect(revision).toBe("ccc");
  });

  it("should not skip a commit whose trailer is false", async () => {
    const revision = await resolveWith(
      runnerWith(commit("aaa", ["Data-Only: false"]) + commit("bbb")),
    );
    expect(revision).toBe("aaa");
  });

  it("should skip a commit that has the data-only trailer among several", async () => {
    const revision = await resolveWith(
      runnerWith(
        commit("aaa", ["Reviewed-By: someone", DATA_ONLY_TRAILER]) +
          commit("bbb"),
      ),
    );
    expect(revision).toBe("bbb");
  });

  it.each([
    ["git fails", runnerWith("", 128)],
    ["git fails after printing a commit", runnerWith(commit("aaa"), 128)],
    ["the output is empty", runnerWith("")],
    [
      "every commit is data-only",
      runnerWith(commit("aaa", [DATA_ONLY_TRAILER])),
    ],
  ])("should return a unique value when %s", async (_name, runProcess) => {
    expect(await resolveWith(runProcess)).toBe(
      `${UNREADABLE_REVISION_PREFIX}${DEPLOY_INSTANT}`,
    );
  });

  it("should recognise the trailer line through surrounding white space", async () => {
    const revision = await resolveWith(
      runnerWith(commit("aaa", [`  ${DATA_ONLY_TRAILER}\r`]) + commit("bbb")),
    );
    expect(revision).toBe("bbb");
  });

  it("should return a unique value when git cannot be started", async () => {
    const runProcess: RunProcess = vi.fn(async () => {
      throw new Error("spawn git ENOENT");
    });
    expect(await resolveWith(runProcess)).toBe(
      `${UNREADABLE_REVISION_PREFIX}${DEPLOY_INSTANT}`,
    );
  });
});
