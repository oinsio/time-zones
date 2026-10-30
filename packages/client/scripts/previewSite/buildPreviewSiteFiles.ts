/**
 * Builds the Netlify configuration files of the pull request preview site. Pure: no I/O.
 * Implements FR2, FR3 of add-pr-preview-deploy (D3).
 */

export const PREVIEW_ROOT_REDIRECT_STATUS = 302;
export const NOINDEX_HEADER = "X-Robots-Tag: noindex";

const PATH_SEPARATOR = "/";
const ROOT_PATH = PATH_SEPARATOR;
const ALL_PATHS = "/*";
const RULE_FIELD_SEPARATOR = "  ";
const HEADER_INDENT = "  ";
const LINE_BREAK = "\n";

export type PreviewSiteFiles = {
  /** Text of the `_redirects` file: the site root goes to the app. */
  redirects: string;
  /** Text of the `_headers` file: no page of the preview is indexed. */
  headers: string;
  /** Directory of the site that holds the app build, e.g. `time-zones`. */
  appDirectory: string;
};

const linesToFileText = (lines: string[]) =>
  lines.map((line) => `${line}${LINE_BREAK}`).join("");

const appDirectoryOf = (appBasePath: string) =>
  appBasePath
    .split(PATH_SEPARATOR)
    .filter((pathSegment) => pathSegment !== "")
    .join(PATH_SEPARATOR);

export function buildPreviewSiteFiles(appBasePath: string): PreviewSiteFiles {
  const redirectRule = [
    ROOT_PATH,
    appBasePath,
    String(PREVIEW_ROOT_REDIRECT_STATUS),
  ].join(RULE_FIELD_SEPARATOR);
  return {
    redirects: linesToFileText([redirectRule]),
    headers: linesToFileText([ALL_PATHS, `${HEADER_INDENT}${NOINDEX_HEADER}`]),
    appDirectory: appDirectoryOf(appBasePath),
  };
}
