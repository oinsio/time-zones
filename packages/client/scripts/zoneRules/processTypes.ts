/**
 * The ports of the zone rules compiler: a process runner and a download, both
 * injected so that every flow is unit-tested without `gpg`, `zic` or a network.
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */

export type ProcessResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export type RunProcess = (
  command: string,
  args: string[],
  options?: { env?: Record<string, string> },
) => Promise<ProcessResult>;

/** Downloads the bytes behind a URL; rejects when the response is not a success. */
export type FetchRelease = (url: string) => Promise<Uint8Array>;
