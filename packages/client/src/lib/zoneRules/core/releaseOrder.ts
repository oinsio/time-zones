/**
 * The order of zone rules release names: year, then the length of the letter
 * sequence, then alphabetical, so `2026z` precedes `2026aa`. The one owner of
 * the order (design D1). Imports only the constants file: Node loads it in
 * strip-only TypeScript mode.
 * Implements FR5 of add-remote-zone-rules-updates.
 */
import { ZONE_RULES_RELEASE_NAME_PATTERN } from "./zoneRulesConstants.ts";

const YEAR_DIGITS = 4;

export type ParsedReleaseName = { year: number; letters: string };

/** The year and letters of a release name, or `undefined` for an invalid name. */
export function parseReleaseName(text: string): ParsedReleaseName | undefined {
  if (!ZONE_RULES_RELEASE_NAME_PATTERN.test(text)) return undefined;
  return {
    year: Number(text.slice(0, YEAR_DIGITS)),
    letters: text.slice(YEAR_DIGITS),
  };
}

function compareParsedNames(
  left: ParsedReleaseName,
  right: ParsedReleaseName,
): number {
  if (left.year !== right.year) return left.year - right.year;
  if (left.letters.length !== right.letters.length) {
    return left.letters.length - right.letters.length;
  }
  if (left.letters === right.letters) return 0;
  return left.letters < right.letters ? -1 : 1;
}

/** Negative when `left` is older, zero when equal, positive when newer. Throws on an invalid name. */
export function compareReleaseNames(left: string, right: string): number {
  const parsedLeft = parseReleaseName(left);
  const parsedRight = parseReleaseName(right);
  if (parsedLeft === undefined || parsedRight === undefined) {
    throw new Error(`Invalid zone rules release name: ${left} ${right}`);
  }
  return compareParsedNames(parsedLeft, parsedRight);
}

/** Whether `candidate` is newer than `current`; false when either name is invalid. */
export function isNewerRelease(candidate: string, current: string): boolean {
  if (
    parseReleaseName(candidate) === undefined ||
    parseReleaseName(current) === undefined
  ) {
    return false;
  }
  return compareReleaseNames(candidate, current) > 0;
}
