/**
 * A small valid zone rules release document of the named release, for tests of
 * the stored release and the update check.
 * Implements FR6, FR9 of add-remote-zone-rules-updates.
 */
import { buildDocument } from "./releaseDocuments";

export const buildReleaseDocument = (release: string) =>
  buildDocument({ release });

/** A release whose only zone is `Asia/Almaty`, kept at one UTC offset for good. */
export const buildAlmatyReleaseDocument = (
  release: string,
  utcOffsetSeconds: number,
) =>
  buildDocument({
    release,
    zones: {
      "Asia/Almaty": {
        types: [[utcOffsetSeconds, "+0", 0]],
        cutoffType: 0,
        changes: [],
        futureRule: "",
      },
    },
  });
