/**
 * The typed error of the release reader (design D1).
 * Implements FR2 of add-zone-rules-from-iana.
 */
export const ZoneRulesReleaseErrorCode = {
  INVALID_SHAPE: "INVALID_SHAPE",
  UNKNOWN_LINK_TARGET: "UNKNOWN_LINK_TARGET",
  CUTOFF_MISMATCH: "CUTOFF_MISMATCH",
  CHANGES_NOT_ASCENDING: "CHANGES_NOT_ASCENDING",
  TYPE_INDEX_OUT_OF_RANGE: "TYPE_INDEX_OUT_OF_RANGE",
} as const;
export type ZoneRulesReleaseErrorCode =
  (typeof ZoneRulesReleaseErrorCode)[keyof typeof ZoneRulesReleaseErrorCode];

export class ZoneRulesReleaseError extends Error {
  readonly code: ZoneRulesReleaseErrorCode;

  constructor(code: ZoneRulesReleaseErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function createShapeError(subject: string): ZoneRulesReleaseError {
  return new ZoneRulesReleaseError(
    ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    `Invalid zone rules release: ${subject}`,
  );
}
