/**
 * Verifies the detached signature of a tzdata archive against the pinned
 * fingerprint of the tz coordinator's key. Every gpg call runs with GNUPGHOME
 * set to a new temporary directory (the home directory is not writable), which
 * is removed afterwards; the fingerprint is read from `VALIDSIG` of
 * `--status-fd` (its last field is the primary key fingerprint).
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RunProcess } from "./processTypes.ts";
import {
  TZ_COORDINATOR_KEY_FILE,
  TZ_COORDINATOR_KEY_FINGERPRINT,
} from "./signing.ts";

const GNUPG_HOME_PREFIX = "zone-rules-gnupg-";
const VALID_SIGNATURE_STATUS = "[GNUPG:] VALIDSIG ";

function readSigningKeyFingerprint(statusOutput: string): string | undefined {
  const statusLine = statusOutput
    .split("\n")
    .find((line) => line.startsWith(VALID_SIGNATURE_STATUS));
  return statusLine?.trim().split(" ").at(-1);
}

export async function verifySignature(
  archivePath: string,
  signaturePath: string,
  runProcess: RunProcess,
): Promise<void> {
  const gnupgHome = await mkdtemp(join(tmpdir(), GNUPG_HOME_PREFIX));
  const env = { GNUPGHOME: gnupgHome };
  try {
    const keyImport = await runProcess(
      "gpg",
      ["--batch", "--import", TZ_COORDINATOR_KEY_FILE],
      { env },
    );
    if (keyImport.exitCode !== 0) {
      throw new Error(
        `The key import failed (gpg exit ${keyImport.exitCode}): ${keyImport.stderr}`,
      );
    }
    const verification = await runProcess(
      "gpg",
      ["--batch", "--status-fd", "1", "--verify", signaturePath, archivePath],
      { env },
    );
    const fingerprint = readSigningKeyFingerprint(verification.stdout);
    if (fingerprint === undefined) {
      throw new Error(
        `The signature check failed: no valid signature on ${archivePath}`,
      );
    }
    if (fingerprint !== TZ_COORDINATOR_KEY_FINGERPRINT) {
      throw new Error(
        `The signature was made by the key ${fingerprint}, not by the pinned key ${TZ_COORDINATOR_KEY_FINGERPRINT}`,
      );
    }
  } finally {
    await rm(gnupgHome, { recursive: true, force: true });
  }
}
