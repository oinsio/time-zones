import { APP_REVISION_FILE } from "@/constants";
import { AppRevisionFailure, type AppRevisionSource } from "@/ports";

export type FetchAppRevisionSourceOptions = {
  fetchFile?: typeof fetch;
  /** The build's base path, ending in a slash. */
  baseUrl?: string;
};

const NO_CACHE_MODE: RequestCache = "no-cache";

const readAppRevision = (document: unknown): string | undefined => {
  const appRevision =
    typeof document === "object" && document !== null
      ? (document as { appRevision?: unknown }).appRevision
      : undefined;
  return typeof appRevision === "string" && appRevision !== ""
    ? appRevision
    : undefined;
};

/**
 * `AppRevisionSource` over `fetch`. The file is requested with
 * `cache: "no-cache"`, a conditional request that beats the host's `max-age`.
 * Implements FR5, FR6 of apply-data-updates-silently (design D2).
 */
export function createFetchAppRevisionSource({
  fetchFile = (input, init) => fetch(input, init),
  baseUrl = import.meta.env.BASE_URL,
}: FetchAppRevisionSourceOptions = {}): AppRevisionSource {
  return {
    fetchAppRevision: async () => {
      let response: Response;
      try {
        response = await fetchFile(`${baseUrl}${APP_REVISION_FILE}`, {
          cache: NO_CACHE_MODE,
        });
      } catch {
        return AppRevisionFailure.REQUEST_FAILED;
      }
      if (!response.ok) return AppRevisionFailure.REQUEST_FAILED;
      try {
        return (
          readAppRevision(await response.json()) ??
          AppRevisionFailure.UNPARSABLE
        );
      } catch {
        return AppRevisionFailure.UNPARSABLE;
      }
    },
  };
}

/** The source the app uses. */
export const fetchAppRevisionSource = createFetchAppRevisionSource();
