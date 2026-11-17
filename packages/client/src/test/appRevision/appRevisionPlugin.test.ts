// Verifies FR2 of apply-data-updates-silently.
import { describe, expect, it, vi } from "vitest";
import { APP_REVISION_FILE } from "../../../app.config.ts";
import {
  appRevisionPlugin,
  buildServedAppRevisionFile,
} from "../../../scripts/appRevision/appRevisionPlugin.ts";

type Hook = (this: unknown, ...args: unknown[]) => unknown;

function createPlugin(command: "build" | "serve") {
  const plugin = appRevisionPlugin({ appRevision: "abc123" });
  (plugin.configResolved as Hook)({ command });
  return plugin;
}

describe("buildServedAppRevisionFile", () => {
  it("should name the app revision in the served file", () => {
    expect(buildServedAppRevisionFile("abc123")).toEqual({
      fileName: APP_REVISION_FILE,
      source: '{"appRevision":"abc123"}',
    });
  });
});

describe("appRevisionPlugin", () => {
  it("should be named after the app revision", () => {
    expect(createPlugin("build").name).toBe("time-zones-app-revision");
  });

  it("should emit the file in a build", () => {
    const emitFile = vi.fn();
    (createPlugin("build").generateBundle as Hook).call({ emitFile });
    expect(emitFile).toHaveBeenCalledWith({
      type: "asset",
      fileName: APP_REVISION_FILE,
      source: '{"appRevision":"abc123"}',
    });
  });

  it("should emit nothing when serving", () => {
    const emitFile = vi.fn();
    (createPlugin("serve").generateBundle as Hook).call({ emitFile });
    expect(emitFile).not.toHaveBeenCalled();
  });
});
