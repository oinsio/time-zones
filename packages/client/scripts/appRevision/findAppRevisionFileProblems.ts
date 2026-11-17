/**
 * The build check of the app revision file: it names the app revision fixed
 * into the code, stays within its size ceiling and is not precached.
 * Implements FR2, NFR-P1 of apply-data-updates-silently (D2).
 */
import {
  APP_REVISION_FILE,
  APP_REVISION_FILE_MAX_BYTES,
} from "../../app.config.ts";
import { findPrecachedAppRevisionFile } from "./findPrecachedAppRevisionFile.ts";

export type AppRevisionFileInput = {
  /** The text of the served file, `undefined` when the build has none. */
  revisionFileText: string | undefined;
  serviceWorkerText: string;
  /** The texts of the JavaScript files of the build, which hold the app revision fixed into the code. */
  scriptTexts: string[];
};

function isRevisionInCode(
  revisionFileText: string,
  scriptTexts: string[],
): boolean {
  try {
    const { appRevision } = JSON.parse(revisionFileText) as {
      appRevision: string;
    };
    return scriptTexts.some((scriptText) => scriptText.includes(appRevision));
  } catch {
    return false;
  }
}

export function findAppRevisionFileProblems({
  revisionFileText,
  serviceWorkerText,
  scriptTexts,
}: AppRevisionFileInput): string[] {
  if (revisionFileText === undefined) {
    return [`${APP_REVISION_FILE} is not in the build`];
  }
  const problems: string[] = [];
  if (Buffer.byteLength(revisionFileText) > APP_REVISION_FILE_MAX_BYTES) {
    problems.push(
      `${APP_REVISION_FILE} is larger than ${APP_REVISION_FILE_MAX_BYTES} bytes`,
    );
  }
  if (!isRevisionInCode(revisionFileText, scriptTexts)) {
    problems.push(
      `${APP_REVISION_FILE} does not name the app revision of the code`,
    );
  }
  if (findPrecachedAppRevisionFile(serviceWorkerText).length > 0) {
    problems.push(`the service worker precaches ${APP_REVISION_FILE}`);
  }
  return problems;
}
