/**
 * The real process runner of the zone rules scripts.
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */
import { execFile } from "node:child_process";
import type { ProcessResult, RunProcess } from "./processTypes.ts";

const MAX_OUTPUT_BYTES = 64 * 1024 * 1024;
const FAILED_TO_START_EXIT_CODE = 127;

export const runChildProcess: RunProcess = (command, args, options) =>
  new Promise<ProcessResult>((resolve) => {
    execFile(
      command,
      args,
      {
        env: { ...process.env, ...options?.env },
        maxBuffer: MAX_OUTPUT_BYTES,
      },
      (error, stdout, stderr) => {
        const exitCode =
          error === null
            ? 0
            : typeof error.code === "number"
              ? error.code
              : FAILED_TO_START_EXIT_CODE;
        resolve({
          exitCode,
          stdout,
          stderr:
            error && exitCode === FAILED_TO_START_EXIT_CODE
              ? error.message
              : stderr,
        });
      },
    );
  });
