import { AppRevisionFailure, type AppRevisionSource } from "@/ports";

export type InMemoryAppRevisionSource = AppRevisionSource & {
  /** How many times the file was requested. */
  readonly requestCount: () => number;
  /** Changes what the file names, for a later read. */
  setAnswer: (answer: string | AppRevisionFailure) => void;
};

/**
 * In-memory `AppRevisionSource` for tests and stories: a scripted answer and
 * counted requests.
 * Implements FR5, FR6 of apply-data-updates-silently (design D2).
 */
export function createInMemoryAppRevisionSource(
  answer: string | AppRevisionFailure = AppRevisionFailure.REQUEST_FAILED,
): InMemoryAppRevisionSource {
  let currentAnswer = answer;
  let requests = 0;
  return {
    fetchAppRevision: async () => {
      requests += 1;
      return currentAnswer;
    },
    requestCount: () => requests,
    setAnswer: (nextAnswer) => {
      currentAnswer = nextAnswer;
    },
  };
}
