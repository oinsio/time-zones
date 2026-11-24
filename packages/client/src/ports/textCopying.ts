/** What happened to a text handed to `TextCopying`. */
export enum CopyOutcome {
  /** The text is on the clipboard. */
  COPIED = "COPIED",
  /** The clipboard is missing or refused the text. */
  FAILED = "FAILED",
}

/**
 * Puts a text on the clipboard.
 * Implements FR12 of add-unix-time-converter-tool (D10).
 */
export interface TextCopying {
  copyText(text: string): Promise<CopyOutcome>;
}
