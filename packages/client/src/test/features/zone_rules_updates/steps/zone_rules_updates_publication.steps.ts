// Verifies FR1, FR2, NFR-P1 of add-remote-zone-rules-updates: the publication's decision and served files.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  DEPLOY_INSTANT,
  RELEASE_TEXT,
} from "@/test/zoneRules/zoneRulesPluginWorld";
import {
  findNewestListedRelease,
  runLatestRelease,
} from "../../../../../scripts/zoneRules/latestRelease.ts";
import { findPrecachedZoneRulesFiles } from "../../../../../scripts/zoneRules/precacheExclusion.ts";
import { buildServedZoneRulesFiles } from "../../../../../scripts/zoneRules/servedZoneRulesFiles.ts";

const feature = await loadFeature("../zone_rules_updates_publication.feature");

const HASHED_ASSET_ENTRY = '{url:"assets/zone-rules-DxK2.json",revision:null}';
const VERSION_FILE_NAME = "zone-rules/version.json";

const listingOf = (fileNames: string[]) =>
  fileNames.map((name) => `<a href="${name}">${name}</a>`).join("\n");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let listing = "";
  let committedRelease = "";
  let newestRelease: string | undefined;
  let publishDecision: { exitCode: number; lines: string[]; output: string[] };
  let servedFiles: ReturnType<typeof buildServedZoneRulesFiles>;
  let serviceWorkerText = "";

  const decide = async () => {
    const lines: string[] = [];
    const output: string[] = [];
    const exitCode = await runLatestRelease({
      fetchListing: async () => listing,
      readCommittedRelease: async () => committedRelease,
      outputFile: undefined,
      log: (line) => {
        lines.push(line);
        if (line !== "already current") output.push(line);
      },
    });
    publishDecision = { exitCode, lines, output };
  };

  // @add-remote-zone-rules-updates @FR1
  f.Scenario("The newest release in the listing", ({ Given, When, Then }) => {
    Given(
      "the releases listing holds {string}, {string}, {string} and {string}",
      (_ctx: unknown, ...fileNames: string[]) => {
        listing = listingOf(fileNames);
      },
    );
    When("the newest release is determined", () => {
      newestRelease = findNewestListedRelease(listing);
    });
    Then("it is {string}", (_ctx, release: string) => {
      expect(newestRelease).toBe(release);
    });
  });

  // @add-remote-zone-rules-updates @FR1
  f.ScenarioOutline("Already current", ({ Given, When, Then }, variables) => {
    Given(
      'the committed release is "<committed>" and the newest listed release is {string}',
      (_ctx, newest: string) => {
        committedRelease = String(variables.committed);
        listing = listingOf([`tzdata${newest}.tar.gz`]);
      },
    );
    When("the workflow decides which release to publish", decide);
    Then(
      "it stops reporting {string} and commits nothing",
      (_ctx, message: string) => {
        expect(publishDecision.lines).toEqual([message]);
        expect(publishDecision.output).toEqual([]);
        expect(publishDecision.exitCode).toBe(0);
      },
    );
  });

  // @add-remote-zone-rules-updates @FR1
  f.Scenario("A newer release", ({ Given, When, Then }) => {
    Given(
      "the committed release is {string} and the newest listed release is {string}",
      (_ctx, committed: string, newest: string) => {
        committedRelease = committed;
        listing = listingOf([
          `tzdata${committed}.tar.gz`,
          `tzdata${newest}.tar.gz`,
        ]);
      },
    );
    When("the workflow decides which release to publish", decide);
    Then(
      "{string} is the release to compile, check, commit and deploy",
      (_ctx, release: string) => {
        expect(publishDecision.output).toEqual([release]);
      },
    );
  });

  // @add-remote-zone-rules-updates @FR2
  f.Scenario("Files in the build", ({ When, Then, And }) => {
    When("the served files are built for the bundled release", () => {
      servedFiles = buildServedZoneRulesFiles(RELEASE_TEXT, DEPLOY_INSTANT);
    });
    Then(
      "{string} names the bundled release and a {string} ending in {string}",
      (_ctx, fileName: string, field: string, suffix: string) => {
        const version = JSON.parse(
          String(
            servedFiles.find((file) => file.fileName === fileName)?.source,
          ),
        );
        expect(version.release).toBe(JSON.parse(RELEASE_TEXT).release);
        expect(version[field].endsWith(suffix)).toBe(true);
      },
    );
    And("the release file equals the bundled release asset", () => {
      const [, releaseFile] = servedFiles;
      expect(releaseFile.fileName).toBe(
        `zone-rules/${JSON.parse(RELEASE_TEXT).release}.json`,
      );
      expect(releaseFile.source).toBe(RELEASE_TEXT);
    });
  });

  // @add-remote-zone-rules-updates @FR2 @NFR-P1
  f.Scenario("Not precached", ({ When, Then, And }) => {
    When("the precache manifest of a service worker is read", () => {
      serviceWorkerText = `precacheAndRoute([{url:"index.html",revision:"1"},${HASHED_ASSET_ENTRY}])`;
    });
    Then(
      "it lists neither {string} nor a release file",
      (_ctx, versionFileName: string) => {
        expect(versionFileName).toBe(VERSION_FILE_NAME);
        expect(findPrecachedZoneRulesFiles(serviceWorkerText)).toEqual([]);
      },
    );
    And("it still lists the bundled release asset", () => {
      expect(serviceWorkerText).toContain("assets/zone-rules-");
    });
  });
});
