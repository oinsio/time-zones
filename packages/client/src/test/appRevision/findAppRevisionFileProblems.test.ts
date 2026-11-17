// Verifies FR2, NFR-P1 of apply-data-updates-silently.
import { describe, expect, it } from "vitest";
import { APP_REVISION_FILE_MAX_BYTES } from "../../../app.config.ts";
import { findAppRevisionFileProblems } from "../../../scripts/appRevision/findAppRevisionFileProblems.ts";
import { findPrecachedAppRevisionFile } from "../../../scripts/appRevision/findPrecachedAppRevisionFile.ts";

const REVISION_FILE = '{"appRevision":"c3"}';
const SCRIPTS = ['const a="c3";'];
const CLEAN_SERVICE_WORKER = 'precacheAndRoute([{url:"index.html"}])';

describe("findAppRevisionFileProblems", () => {
  it("should find no problem for a served, small, uncached file named in the code", () => {
    expect(
      findAppRevisionFileProblems({
        revisionFileText: REVISION_FILE,
        serviceWorkerText: CLEAN_SERVICE_WORKER,
        scriptTexts: SCRIPTS,
      }),
    ).toEqual([]);
  });

  it("should report a build without the file", () => {
    const problems = findAppRevisionFileProblems({
      revisionFileText: undefined,
      serviceWorkerText: CLEAN_SERVICE_WORKER,
      scriptTexts: SCRIPTS,
    });
    expect(problems).toEqual(["app-revision.json is not in the build"]);
  });

  it("should report a file over the size ceiling", () => {
    const largeFile = `{"appRevision":"c3","padding":"${"x".repeat(APP_REVISION_FILE_MAX_BYTES)}"}`;
    const problems = findAppRevisionFileProblems({
      revisionFileText: largeFile,
      serviceWorkerText: CLEAN_SERVICE_WORKER,
      scriptTexts: SCRIPTS,
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("larger");
  });

  it("should accept a file of exactly the ceiling", () => {
    const padding = "x".repeat(
      APP_REVISION_FILE_MAX_BYTES - '{"appRevision":"c3","p":""}'.length,
    );
    expect(
      findAppRevisionFileProblems({
        revisionFileText: `{"appRevision":"c3","p":"${padding}"}`,
        serviceWorkerText: CLEAN_SERVICE_WORKER,
        scriptTexts: SCRIPTS,
      }),
    ).toEqual([]);
  });

  it.each([
    ["the code names another revision", ['const a="zz";']],
    ["the code has no scripts", []],
  ])(
    "should report a file whose revision is missing when %s",
    (_name, scriptTexts) => {
      const problems = findAppRevisionFileProblems({
        revisionFileText: REVISION_FILE,
        serviceWorkerText: CLEAN_SERVICE_WORKER,
        scriptTexts,
      });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain("app revision of the code");
    },
  );

  it("should report a file that is not JSON", () => {
    const problems = findAppRevisionFileProblems({
      revisionFileText: "not json",
      serviceWorkerText: CLEAN_SERVICE_WORKER,
      scriptTexts: SCRIPTS,
    });
    expect(problems).toHaveLength(1);
  });

  it("should report a precached file", () => {
    const problems = findAppRevisionFileProblems({
      revisionFileText: REVISION_FILE,
      serviceWorkerText: '[{url:"app-revision.json"}]',
      scriptTexts: SCRIPTS,
    });
    expect(problems).toEqual([
      "the service worker precaches app-revision.json",
    ]);
  });
});

describe("findPrecachedAppRevisionFile", () => {
  it("should find nothing in a clean service worker", () => {
    expect(findPrecachedAppRevisionFile(CLEAN_SERVICE_WORKER)).toEqual([]);
  });
});
