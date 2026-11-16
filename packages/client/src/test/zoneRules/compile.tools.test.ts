// @build-zic-from-tzcode: the zone rules compiler builds and uses the zone tools of the release
// Verifies FR1, FR2, FR3, FR5 of build-zic-from-tzcode.
import { describe, expect, it } from "vitest";
import {
  compile,
  isProgram,
  logsMention,
  VALID_SCENARIO,
} from "./compileWorld";

const BUILT_ZIC = /[\\/]tools[\\/]zic$/;

describe("the zone rules compiler with the zone tools", () => {
  it("compiles with the zic built from the code archive", async () => {
    const run = await compile(VALID_SCENARIO);
    const zicCall = run.calls.find((call) => isProgram(call, "zic"));
    expect(zicCall?.command).toMatch(BUILT_ZIC);
    expect(run.exitCode).toBe(0);
  });

  it("builds the zone tools with make before it compiles", async () => {
    const run = await compile(VALID_SCENARIO);
    const programs = run.calls.map((call) => call.command);
    const makeIndex = programs.indexOf("make");
    const zicIndex = run.calls.findIndex((call) => isProgram(call, "zic"));
    expect(makeIndex).toBeGreaterThanOrEqual(0);
    expect(makeIndex).toBeLessThan(zicIndex);
  });

  it("never runs a zic or zdump of the operating system", async () => {
    const run = await compile(VALID_SCENARIO);
    const programs = run.calls.map((call) => call.command);
    expect(programs).not.toContain("zic");
    expect(programs).not.toContain("zdump");
  });

  it.each([
    [
      "the code signature does not verify",
      { codeVerifyStatus: "[GNUPG:] BADSIG ED97E90E62AA7E34 Paul\n" },
      "tzcode2026f.tar.gz",
    ],
    [
      "the code archive names another release",
      { codeArchiveVersion: "2026e" },
      "The code archive's version file names 2026e, but 2026f was requested",
    ],
    [
      "make fails",
      { makeFailure: { exitCode: 2, stderr: "cc: not found" } },
      "make failed (exit 2): cc: not found",
    ],
  ])(
    "stops before zic and writes nothing when %s",
    async (_description, failure, message) => {
      const run = await compile({ ...VALID_SCENARIO, ...failure });
      expect(run.exitCode).not.toBe(0);
      expect(logsMention(run, message)).toBe(true);
      expect(run.calls.some((call) => isProgram(call, "zic"))).toBe(false);
      expect(run.writtenFiles.size).toBe(0);
    },
  );
});
