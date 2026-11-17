import { useCallback, useState } from "react";
import { type AppRevisionSource, isAppRevisionFailure } from "@/ports";

export type PublishedAppRevision = {
  /** The app revision the site named at the last successful read. */
  appRevision: string | undefined;
  /** Reads the file now, only while online; a failure keeps the last value. */
  readAppRevision: () => Promise<void>;
};

/**
 * The app revision of the published site, read on request.
 * Implements FR5, FR6 of apply-data-updates-silently (D3).
 */
export function usePublishedAppRevision(
  source: AppRevisionSource,
): PublishedAppRevision {
  const [appRevision, setAppRevision] = useState<string | undefined>();
  const readAppRevision = useCallback(async () => {
    if (!navigator.onLine) return;
    const outcome = await source.fetchAppRevision();
    if (!isAppRevisionFailure(outcome)) setAppRevision(outcome);
  }, [source]);
  return { appRevision, readAppRevision };
}
