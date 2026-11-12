import {
  ZONE_RULES_RELEASE_DIRECTORY,
  ZONE_RULES_RELEASE_FILE_EXTENSION,
  ZONE_RULES_VERSION_PATH,
} from "@/constants";
import {
  ZoneRulesSourceFailure,
  type ZoneRulesVersion,
  type ZoneRulesVersionSource,
} from "@/ports";

export type FetchZoneRulesVersionSourceOptions = {
  fetchFile?: typeof fetch;
  /** The build's base path, ending in a slash. */
  baseUrl?: string;
};

const isZoneRulesVersion = (document: unknown): document is ZoneRulesVersion =>
  typeof document === "object" &&
  document !== null &&
  typeof (document as { release?: unknown }).release === "string";

async function readJson(
  request: () => Promise<Response>,
): Promise<unknown | ZoneRulesSourceFailure> {
  let response: Response;
  try {
    response = await request();
  } catch {
    return ZoneRulesSourceFailure.REQUEST_FAILED;
  }
  if (!response.ok) return ZoneRulesSourceFailure.REQUEST_FAILED;
  try {
    return await response.json();
  } catch {
    return ZoneRulesSourceFailure.UNPARSABLE;
  }
}

/**
 * `ZoneRulesVersionSource` over `fetch`. The version file is requested with
 * `cache: "no-cache"`, a conditional request that beats the host's
 * `max-age`; a release file's name changes with its content, so it is
 * requested plainly.
 * Implements FR3, FR4 of add-remote-zone-rules-updates (design D4).
 */
export function createFetchZoneRulesVersionSource({
  fetchFile = (input, init) => fetch(input, init),
  baseUrl = import.meta.env.BASE_URL,
}: FetchZoneRulesVersionSourceOptions = {}): ZoneRulesVersionSource {
  return {
    fetchVersion: async () => {
      const document = await readJson(() =>
        fetchFile(`${baseUrl}${ZONE_RULES_VERSION_PATH}`, {
          cache: "no-cache",
        }),
      );
      if (document === ZoneRulesSourceFailure.REQUEST_FAILED) return document;
      return isZoneRulesVersion(document)
        ? { release: document.release }
        : ZoneRulesSourceFailure.UNPARSABLE;
    },
    fetchRelease: (name) =>
      readJson(() =>
        fetchFile(
          `${baseUrl}${ZONE_RULES_RELEASE_DIRECTORY}${name}${ZONE_RULES_RELEASE_FILE_EXTENSION}`,
        ),
      ),
  };
}

/** The source the app uses. */
export const fetchZoneRulesVersionSource = createFetchZoneRulesVersionSource();
