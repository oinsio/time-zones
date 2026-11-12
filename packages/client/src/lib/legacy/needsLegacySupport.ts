const ARRAY_AT_METHOD = "at";

/**
 * Whether the engine lacks a built-in the app relies on: `Array#at` (marks
 * Safari before 15.4 and covers the core-js gap) or `ResizeObserver`. The state
 * of the engine's zone data plays no part: the zone rules replace it.
 * Implements FR2 of support-legacy-ios-12-safari (D2) and FR5 of
 * add-zone-rules-from-iana (D9).
 */
export function needsLegacySupport(): boolean {
  return (
    !(ARRAY_AT_METHOD in Array.prototype) ||
    typeof globalThis.ResizeObserver === "undefined"
  );
}
