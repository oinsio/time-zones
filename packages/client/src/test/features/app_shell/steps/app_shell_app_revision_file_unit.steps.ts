// Verifies FR2, NFR-P1 of apply-data-updates-silently: the app revision file of a build.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { APP_REVISION_FILE_MAX_BYTES } from "../../../../../app.config.ts";
import { buildServedAppRevisionFile } from "../../../../../scripts/appRevision/appRevisionPlugin.ts";
import { findAppRevisionFileProblems } from "../../../../../scripts/appRevision/findAppRevisionFileProblems.ts";
import { collectInitialScriptUrls } from "../../../../../scripts/bundle/initialScripts.ts";

const feature = await loadFeature(
  "../app_shell_app_revision_file_unit.feature",
);

const KILOBYTE_IN_BYTES = 1024;
const ENTRY_HTML = `<html><head><script type="module" src="/time-zones/assets/index-A1.js"></script><link rel="modulepreload" href="/time-zones/assets/vendor-B2.js"></head></html>`;
const CLEAN_SERVICE_WORKER = `precacheAndRoute([{url:"index.html",revision:"1"}])`;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let appRevision = "";
  let serviceWorkerText = CLEAN_SERVICE_WORKER;
  let servedText = "";
  let problems: string[] = [];
  let initialScriptUrls: string[] = [];

  const checkFile = () => {
    problems = findAppRevisionFileProblems({
      revisionFileText: servedText,
      serviceWorkerText,
      scriptTexts: [`const revision="${appRevision}";`],
    });
  };

  // @apply-data-updates-silently @FR2 @NFR-P1
  f.Scenario("The file in the build", ({ Given, When, Then, And }) => {
    Given(
      "a build with the app revision {string}",
      (_ctx, revision: string) => {
        appRevision = revision;
        servedText = buildServedAppRevisionFile(revision).source;
      },
    );
    When("the app revision file of the build is checked", checkFile);
    Then(
      "the file names the app revision {string}",
      (_ctx, revision: string) => {
        expect(JSON.parse(servedText)).toEqual({ appRevision: revision });
        expect(problems).toEqual([]);
      },
    );
    And("the file is at most 1 KB", () => {
      expect(APP_REVISION_FILE_MAX_BYTES).toBe(KILOBYTE_IN_BYTES);
      expect(Buffer.byteLength(servedText)).toBeLessThanOrEqual(
        APP_REVISION_FILE_MAX_BYTES,
      );
    });
  });

  // @apply-data-updates-silently @FR2 @NFR-P1
  f.Scenario("Not precached", ({ Given, When, Then }) => {
    Given(
      "the precache manifest of the built service worker lists {string}",
      (_ctx, fileName: string) => {
        appRevision = "c3";
        servedText = buildServedAppRevisionFile(appRevision).source;
        serviceWorkerText = `precacheAndRoute([{url:"${fileName}",revision:"1"}])`;
      },
    );
    When("the app revision file of the build is checked", checkFile);
    Then("the check fails because the file is precached", () => {
      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain("precaches");
    });
  });

  // @apply-data-updates-silently @FR2 @NFR-P1
  f.Scenario("Not initial JavaScript", ({ Given, When, Then }) => {
    Given("the entry page of the build and its app revision file", () => {
      servedText = buildServedAppRevisionFile("c3").source;
    });
    When("the initial JavaScript of the build is collected", () => {
      initialScriptUrls = collectInitialScriptUrls(ENTRY_HTML);
    });
    Then(
      "{string} is not among the initial scripts",
      (_ctx, fileName: string) => {
        expect(initialScriptUrls.length).toBeGreaterThan(0);
        expect(initialScriptUrls.some((url) => url.includes(fileName))).toBe(
          false,
        );
      },
    );
  });
});
