/**
 * Downloads a tzdata release and its detached signature from the IANA release
 * address, never a `-latest` link. Uses Node `fetch` (design D7, no proxy code:
 * the sandbox sets NODE_USE_ENV_PROXY=1).
 * Implements FR7 of add-zone-rules-from-iana.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FetchRelease } from "./processTypes.ts";

export const IANA_RELEASES_URL = "https://data.iana.org/time-zones/releases/";
const SIGNATURE_SUFFIX = ".asc";

export function getArchiveFileName(release: string): string {
  return `tzdata${release}.tar.gz`;
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
  fetchRelease: FetchRelease,
  directory: string,
): Promise<{ archivePath: string; signaturePath: string }> {
  const archiveFileName = getArchiveFileName(release);
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
