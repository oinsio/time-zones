// @add-remote-zone-rules-updates @FR2, NFR-P1: the files the site serves for the zone rules update check
import { describe, expect, it } from "vitest";
import { buildServedZoneRulesFiles } from "../../../scripts/zoneRules/servedZoneRulesFiles.ts";
import { buildReleaseDocument } from "./buildReleaseDocument";
import { createPlugin, RELEASE_TEXT } from "./zoneRulesPluginWorld";

const DEPLOY_INSTANT = "2026-03-08T07:30:00.000Z";
const RELEASE_TEXT_OF_2026G = JSON.stringify(buildReleaseDocument("2026g"));

describe("buildServedZoneRulesFiles", () => {
  const files = buildServedZoneRulesFiles(
    RELEASE_TEXT_OF_2026G,
    DEPLOY_INSTANT,
  );
  const findFile = (fileName: string) =>
    files.find((file) => file.fileName === fileName);

  it("should serve the version file and the release file", () => {
    expect(files.map((file) => file.fileName)).toEqual([
      "zone-rules/version.json",
      "zone-rules/2026g.json",
    ]);
  });

  it("should name the release and the publication instant in the version file", () => {
    const version = JSON.parse(
      String(findFile("zone-rules/version.json")?.source),
    );
    expect(version).toEqual({ release: "2026g", publishedAt: DEPLOY_INSTANT });
    expect(version.publishedAt).toMatch(/Z$/);
  });

  it("should serve the release file as the input bytes", () => {
    expect(findFile("zone-rules/2026g.json")?.source).toBe(
      RELEASE_TEXT_OF_2026G,
    );
  });
});

describe("zoneRulesPlugin served files", () => {
  const emitInBuild = () => {
    const { plugin, call } = createPlugin("build");
    const emitted: { fileName: string; source: string; type: string }[] = [];
    call(plugin.generateBundle, {
      emitFile: (file: never) => emitted.push(file),
    });
    return emitted;
  };

  it("should emit both files in a build, with the committed release", () => {
    const emitted = emitInBuild();
    expect(emitted.map((file) => file.fileName)).toEqual([
      "zone-rules/version.json",
      expect.stringMatching(/^zone-rules\/\d{4}[a-z]+\.json$/),
    ]);
    expect(emitted[1].source).toBe(RELEASE_TEXT);
    expect(emitted.every((file) => file.type === "asset")).toBe(true);
  });

  it("should emit nothing while serving", () => {
    const { plugin, call } = createPlugin("serve");
    const emitted: unknown[] = [];
    call(plugin.generateBundle, {
      emitFile: (file: unknown) => emitted.push(file),
    });
    expect(emitted).toEqual([]);
  });
});
