/** What happened to a text handed to `TextSharing`. */
export enum ShareOutcome {
  /** The system share took the text. */
  SHARED = "SHARED",
  /** The user closed the system share; nothing more happens. */
  CANCELLED = "CANCELLED",
  /** The text was copied to the clipboard. */
  COPIED = "COPIED",
  /** Neither sharing nor copying worked. */
  FAILED = "FAILED",
}

/**
 * Hands a text to the system share, or copies it where the browser cannot
 * share.
 * Implements FR15 of add-grid-meeting-range-and-share (D4).
 */
export interface TextSharing {
  shareText(text: string): Promise<ShareOutcome>;
}
