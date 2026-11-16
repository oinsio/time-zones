/**
 * Downloads an archive of a release (the data `tzdata` or the code `tzcode`)
 * and its detached signature from the IANA release address, never a `-latest`
 * link. Uses Node `fetch` (design D7, no proxy code: the sandbox sets
 * NODE_USE_ENV_PROXY=1).
 * Implements FR7 of add-zone-rules-from-iana.
 * Implements FR1 of build-zic-from-tzcode (D2): the code archive.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FetchRelease } from "./processTypes.ts";

export const IANA_RELEASES_URL = "https://data.iana.org/time-zones/releases/";
const SIGNATURE_SUFFIX = ".asc";

/** The two archives IANA publishes per release: the data and the code of `zic` and `zdump`. */
export const ArchiveKind = {
  DATA: "tzdata",
  CODE: "tzcode",
} as const;
export type ArchiveKind = (typeof ArchiveKind)[keyof typeof ArchiveKind];

const ARCHIVE_SUFFIX = ".tar.gz";

export function getArchiveFileName(release: string, kind: ArchiveKind): string {
  return `${kind}${release}${ARCHIVE_SUFFIX}`;
}

export const fetchBytes: FetchRelease = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Downloading ${url} failed: HTTP ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

export async function downloadRelease(
  release: string,
  kind: ArchiveKind,
  fetchRelease: FetchRelease,
  directory: string,
): Promise<{ archivePath: string; signaturePath: string }> {
  const archiveFileName = getArchiveFileName(release, kind);
  const archivePath = join(directory, archiveFileName);
  const signaturePath = `${archivePath}${SIGNATURE_SUFFIX}`;
  const archiveUrl = `${IANA_RELEASES_URL}${archiveFileName}`;
  await writeFile(archivePath, await fetchRelease(archiveUrl));
  await writeFile(
    signaturePath,
    await fetchRelease(`${archiveUrl}${SIGNATURE_SUFFIX}`),
  );
  return { archivePath, signaturePath };
}
