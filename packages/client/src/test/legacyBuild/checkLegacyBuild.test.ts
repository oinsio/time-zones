// FR12, FR13 of support-legacy-ios-12-safari: the script reads a build directory and names what it rejects.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const PACKAGE_ROOT = join(import.meta.dirname, "../../..");
const SCRIPT = join(PACKAGE_ROOT, "scripts/check-legacy-build.mjs");
const CLEAN_SCRIPT = "export const answer = 42;";
const CLEAN_CSS = ".min-h-dvh{min-height:100vh;min-height:100dvh}";

let buildDirectory: string;

const writeAsset = (fileName: string, content: string) => {
  mkdirSync(join(buildDirectory, "assets"), { recursive: true });
  writeFileSync(join(buildDirectory, "assets", fileName), content);
};

const runCheck = () => {
  try {
    const output = execFileSync("node", [SCRIPT, buildDirectory], {
      encoding: "utf8",
      stdio: "pipe",
    });
    return { exitCode: 0, output };
  } catch (failure) {
    const { status, stderr } = failure as { status: number; stderr: string };
    return { exitCode: status, output: stderr };
  }
};

describe("check-legacy-build", () => {
  beforeEach(() => {
    buildDirectory = mkdtempSync(join(tmpdir(), "legacy-build-"));
  });
  afterEach(() => {
    rmSync(buildDirectory, { recursive: true, force: true });
  });

  it("should pass a clean build", () => {
    writeAsset("main.js", CLEAN_SCRIPT);
    writeAsset("main.css", CLEAN_CSS);

    expect(runCheck().exitCode).toBe(0);
  });

  it.each([
    ["main.css", ".a{inset:0}", "inset shorthand"],
    ["main.css", ".min-h-dvh{min-height:100dvh}", "dvh height"],
    ["main.js", "const a = b?.c;", "optional chaining"],
  ])("should fail and name %s for %s", (fileName, content, construct) => {
    writeAsset(fileName, content);

    const { exitCode, output } = runCheck();

    expect(exitCode).not.toBe(0);
    expect(output).toContain(`assets/${fileName}`);
    expect(output).toContain(construct);
  });

  it("should also read the service worker and the workbox runtime", () => {
    writeFileSync(join(buildDirectory, "sw.js"), "a ?? b");
    writeFileSync(join(buildDirectory, "workbox-1.js"), "const a = b?.c;");

    const { output } = runCheck();

    expect(output).toContain("sw.js");
    expect(output).toContain("workbox-1.js");
  });

  it("should ignore files that are not scripts or stylesheets", () => {
    writeAsset("data.json", '{"a": "inset: 0"}');

    expect(runCheck().exitCode).toBe(0);
  });
});
