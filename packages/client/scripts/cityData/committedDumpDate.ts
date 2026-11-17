/**
 * The dump date of the committed city data: the one validation of
 * `source.dumpDate` (the format check of the city data and the build read it
 * here), and the reader the build uses. `readDumpDate` of `download.ts` stays
 * the reader of the archive.
 * Implements FR12, NFR-P3 of apply-data-updates-silently (D6).
 */
import { Temporal } from "../../src/lib/temporal.ts";

const DUMP_DATE_ERROR_PREFIX = "The dump date of the committed city data";

/** True for a string that is an ISO calendar date, such as `2026-11-14`. */
export function isDumpDate(value: unknown): value is string {
  try {
    // Anything but an ISO date text throws, or prints as another value.
    return Temporal.PlainDate.from(value as string).toString() === value;
  } catch {
    return false;
  }
}

function readSourceDumpDate(cityDataText: string): unknown {
  try {
    return JSON.parse(cityDataText).source.dumpDate;
    // Stryker disable next-line BlockStatement: equivalent — the function returns undefined either way
  } catch {
    return undefined;
  }
}

/** The `source.dumpDate` of the committed city data text; throws unless it is an ISO date. */
export function readCommittedDumpDate(cityDataText: string): string {
  const dumpDate = readSourceDumpDate(cityDataText);
  if (!isDumpDate(dumpDate)) {
    throw new Error(
      `${DUMP_DATE_ERROR_PREFIX} is not an ISO date: ${JSON.stringify(dumpDate)}`,
    );
  }
  return dumpDate;
}
