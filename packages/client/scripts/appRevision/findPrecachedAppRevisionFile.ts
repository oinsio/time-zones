/**
 * Finds the entries of the app revision file in the text of the service
 * worker: the file must not be precached, or the check would read a stale copy.
 * Implements FR2, NFR-P1 of apply-data-updates-silently (D2).
 */
import { APP_REVISION_FILE } from "../../app.config.ts";

export function findPrecachedAppRevisionFile(
  serviceWorkerText: string,
): string[] {
  return serviceWorkerText.includes(APP_REVISION_FILE)
    ? [APP_REVISION_FILE]
    : [];
}
