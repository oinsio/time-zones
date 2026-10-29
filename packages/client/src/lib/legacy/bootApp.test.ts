// FR2 of support-legacy-ios-12-safari: boot loads legacy support before the app, only when needed.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bootApp } from "./bootApp";

afterEach(() => {
  vi.restoreAllMocks();
});

const SOURCE_ROOT = join(__dirname, "..", "..");
const FORBIDDEN_STATIC_IMPORT =
  /^\s*import\s[^;]*?from\s+["'](@\/lib\/temporal|temporal-polyfill|react|\.\/main)["']/m;

function createLoaders(needsLegacy: boolean, legacyLoad?: () => Promise<void>) {
  const callLog: string[] = [];
  return {
    callLog,
    steps: {
      needsLegacySupport: () => needsLegacy,
      loadLegacySupport:
        legacyLoad ??
        vi.fn(async () => {
          callLog.push("legacy");
        }),
      loadApp: vi.fn(async () => {
        callLog.push("app");
      }),
    },
  };
}

describe("bootApp", () => {
  it("should skip legacy support and load the app once when nothing is missing", async () => {
    const { steps } = createLoaders(false);

    await bootApp(steps);

    expect(steps.loadLegacySupport).not.toHaveBeenCalled();
    expect(steps.loadApp).toHaveBeenCalledTimes(1);
  });

  it("should finish legacy support before the app starts", async () => {
    const { steps, callLog } = createLoaders(true, async () => {
      await Promise.resolve();
      callLog.push("legacy");
    });

    await bootApp(steps);

    expect(callLog).toEqual(["legacy", "app"]);
  });

  it("should still load the app when legacy support fails", async () => {
    const { steps } = createLoaders(true, () =>
      Promise.reject(new Error("chunk missing")),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await bootApp(steps);

    expect(steps.loadApp).toHaveBeenCalledTimes(1);
  });

  // R4 of review-code: the root cause of a failed polyfill load is logged.
  it("should log the error when legacy support fails", async () => {
    const loadError = new Error("chunk missing");
    const { steps } = createLoaders(true, () => Promise.reject(loadError));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await bootApp(steps);

    expect(errorSpy).toHaveBeenCalledWith(loadError);
  });
});

describe("static imports before the shim", () => {
  const legacyDirectory = join(SOURCE_ROOT, "lib", "legacy");
  const bootSources = [
    join(SOURCE_ROOT, "boot.ts"),
    ...readdirSync(legacyDirectory)
      .filter(
        (name) =>
          name.endsWith(".ts") && !/\.(test|temporal\.test)\.ts$/.test(name),
      )
      .map((name) => join(legacyDirectory, name)),
  ];

  it.each(bootSources)(
    "%s imports no module that evaluates Temporal",
    (path) => {
      expect(readFileSync(path, "utf8")).not.toMatch(FORBIDDEN_STATIC_IMPORT);
    },
  );
});
