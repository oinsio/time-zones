// @build-zic-from-tzcode: the zone rules check runs the zone tools of the committed release
// Verifies FR4, FR5 of build-zic-from-tzcode.
import { describe, expect, it } from "vitest";
import { check, createCompiledDirectory } from "./checkWorld";

const BUILT_ZDUMP = /[\\/]tools[\\/]zdump$/;

describe("the zone rules check with the zone tools", () => {
  it.each([
    ["by default", () => []],
    [
      "with a compiled directory",
      () => ["--compiled", createCompiledDirectory()],
    ],
  ])("runs the zdump built from the code archive %s", async (_mode, argv) => {
    const run = await check(argv());
    expect(run.zdumpCommands).toEqual([expect.stringMatching(BUILT_ZDUMP)]);
    expect(run.logLines).toContain("0 differences");
  });

  it.each([
    ["by default", () => []],
    [
      "with a compiled directory",
      () => ["--compiled", createCompiledDirectory()],
    ],
  ])(
    "never runs a zic or zdump of the operating system %s",
    async (_mode, argv) => {
      const run = await check(argv());
      const programs = [
        ...run.calls.map((call) => call.command),
        ...run.zdumpCommands,
      ];
      expect(programs).not.toContain("zic");
      expect(programs).not.toContain("zdump");
    },
  );

  it("fails and says why when the zone tools cannot be built", async () => {
    const run = await check([], undefined, false, undefined, {
      makeFailure: { exitCode: 2, stderr: "cc: not found" },
    });
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain(
      "make failed (exit 2): cc: not found",
    );
    expect(run.zdumpCommands).toEqual([]);
  });
});
