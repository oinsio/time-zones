// Implements FR2, FR3, UX1 of add-pr-preview-deploy (design D3): the files of the preview site;
// the redirect to the app path makes the preview open the same app (UX1).
import { describe, expect, it } from "vitest";
import { APP_BASE_PATH } from "../../../app.config";
import {
  buildPreviewSiteFiles,
  NOINDEX_HEADER,
  PREVIEW_ROOT_REDIRECT_STATUS,
} from "../../../scripts/previewSite/buildPreviewSiteFiles";

const LINE_BREAK = "\n";
const FOUND_STATUS = 302;
const ROOT_PATH = "/";
const ALL_PATHS = "/*";
const HEADER_INDENT = "  ";
const EXPECTED_NOINDEX_HEADER = "X-Robots-Tag: noindex";
const REDIRECT_TOKEN_COUNT = 3;

const nonEmptyLinesOf = (fileText: string) =>
  fileText.split(LINE_BREAK).filter((line) => line.trim() !== "");

const tokensOf = (line: string) => line.trim().split(/\s+/);

// Built inside each test, not at describe time: an error thrown while Vitest collects
// the suite is not reported as a failed test, so Stryker would count the mutant as survived.
const realRedirects = () => buildPreviewSiteFiles(APP_BASE_PATH).redirects;
const realHeaders = () => buildPreviewSiteFiles(APP_BASE_PATH).headers;

describe("buildPreviewSiteFiles", () => {
  describe("constants", () => {
    it("redirects the preview root with status 302", () => {
      // FR3 of add-pr-preview-deploy
      expect(PREVIEW_ROOT_REDIRECT_STATUS).toBe(FOUND_STATUS);
    });

    it("names the noindex robots header", () => {
      // FR3 of add-pr-preview-deploy
      expect(NOINDEX_HEADER).toBe(EXPECTED_NOINDEX_HEADER);
    });
  });

  describe("appDirectory", () => {
    it("is time-zones for the real APP_BASE_PATH", () => {
      // FR2 of add-pr-preview-deploy
      expect(buildPreviewSiteFiles(APP_BASE_PATH).appDirectory).toBe(
        "time-zones",
      );
    });

    it.each([
      ["/a/", "a"],
      ["/a/b/", "a/b"],
      ["/time-zones/", "time-zones"],
    ])(
      "is %s without the outer slashes: %s",
      (appBasePath, expectedDirectory) => {
        // FR2 of add-pr-preview-deploy
        expect(buildPreviewSiteFiles(appBasePath).appDirectory).toBe(
          expectedDirectory,
        );
      },
    );
  });

  describe("redirects", () => {
    it("has exactly one rule", () => {
      // FR3 of add-pr-preview-deploy
      expect(nonEmptyLinesOf(realRedirects())).toHaveLength(1);
    });

    it("redirects the root to the base path with 302", () => {
      // FR3 of add-pr-preview-deploy
      expect(tokensOf(nonEmptyLinesOf(realRedirects())[0])).toEqual([
        ROOT_PATH,
        APP_BASE_PATH,
        String(FOUND_STATUS),
      ]);
    });

    it("is the exact Netlify _redirects text, ending with a line break", () => {
      // FR3 of add-pr-preview-deploy
      expect(realRedirects()).toBe(`/  /time-zones/  302${LINE_BREAK}`);
    });

    it.each(["/a/", "/a/b/"])(
      "redirects the root to the base path %s",
      (appBasePath) => {
        // FR3 of add-pr-preview-deploy
        const redirectTokens = tokensOf(
          buildPreviewSiteFiles(appBasePath).redirects,
        );
        expect(redirectTokens).toEqual([
          ROOT_PATH,
          appBasePath,
          String(FOUND_STATUS),
        ]);
      },
    );

    it("has three tokens on its rule", () => {
      // FR3 of add-pr-preview-deploy
      expect(tokensOf(realRedirects())).toHaveLength(REDIRECT_TOKEN_COUNT);
    });
  });

  describe("headers", () => {
    it("starts with the rule for every path", () => {
      // FR3 of add-pr-preview-deploy
      expect(realHeaders().split(LINE_BREAK)[0]).toBe(ALL_PATHS);
    });

    it("applies the indented noindex header to that rule", () => {
      // FR3 of add-pr-preview-deploy
      expect(realHeaders().split(LINE_BREAK)[1]).toBe(
        `${HEADER_INDENT}${EXPECTED_NOINDEX_HEADER}`,
      );
    });

    it("is the exact Netlify _headers text, ending with a line break", () => {
      // FR3 of add-pr-preview-deploy
      expect(realHeaders()).toBe(
        `/*${LINE_BREAK}  X-Robots-Tag: noindex${LINE_BREAK}`,
      );
    });

    it("does not depend on the base path", () => {
      // FR3 of add-pr-preview-deploy
      expect(buildPreviewSiteFiles("/a/b/").headers).toBe(realHeaders());
    });
  });
});
