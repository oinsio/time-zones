/**
 * Two builds of the app served by a static server of the E2E fixture (design
 * D8): build A, a build B with A's app revision (a silent update) and a build
 * B with another app revision (an app change). The server answers with one of
 * them at a time under the app's base path; nothing is written inside the
 * repository.
 * Implements FR3, FR4, FR11, M1 of apply-data-updates-silently (D8).
 */
import { execFile } from "node:child_process";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { promisify } from "node:util";
import { ZONE_RULES_VERSION_PATH } from "@/constants";
import {
  APP_BASE_PATH,
  APP_REVISION_FILE,
  SILENT_UPDATE_E2E_PORT,
} from "../../../../../app.config";
import { buildNewerReleaseFiles } from "../../zone_rules_updates/steps/zoneRulesPublishedFiles";

const runProcess = promisify(execFile);

const BUILD_TIMEOUT_MS = 240_000;
const TEMPORARY_DIRECTORY_PREFIX = "time-zones-silent-update-";
const ANOTHER_APP_REVISION = "e2e-another-app-revision";
const INDEX_FILE = "index.html";
const ENTRY_SCRIPT_PATTERN = /<script[^>]*type="module"[^>]*src="([^"]+)"/;
const HTTP_NOT_FOUND = 404;
const HTTP_OK = 200;
const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export enum SiteBuild {
  A = "A",
  SILENT = "SILENT",
  APP_CHANGE = "APP_CHANGE",
}

type BuiltSite = {
  directory: string;
  appRevision: string;
  /** The `src` of the entry script of the build: which build a page runs. */
  entryScriptUrl: string;
  /** The instant the build was made, ISO 8601 with the Z suffix. */
  deployInstant: string;
};

export type SilentUpdateSite = {
  /** The address of the app, under the base path. */
  appUrl: string;
  serve: (build: SiteBuild) => void;
  /** From now on the site names a newer zone rules release, which changes the device time zone. */
  publishNewerZoneRules: () => void;
  describe: (build: SiteBuild) => BuiltSite;
  stop: () => Promise<void>;
};

async function buildSite(
  clientRoot: string,
  appRevision?: string,
): Promise<BuiltSite> {
  const directory = await mkdtemp(join(tmpdir(), TEMPORARY_DIRECTORY_PREFIX));
  await runProcess(
    "pnpm",
    ["exec", "vite", "build", "--outDir", directory, "--emptyOutDir"],
    {
      cwd: clientRoot,
      env: {
        ...process.env,
        ...(appRevision === undefined ? {} : { APP_REVISION: appRevision }),
      },
      timeout: BUILD_TIMEOUT_MS,
    },
  );
  const readJson = (file: string) =>
    JSON.parse(readFileSync(join(directory, file), "utf8"));
  const entryHtml = readFileSync(join(directory, INDEX_FILE), "utf8");
  return {
    directory,
    appRevision: readJson(APP_REVISION_FILE).appRevision,
    entryScriptUrl: ENTRY_SCRIPT_PATTERN.exec(entryHtml)?.[1] ?? "",
    deployInstant: readJson(ZONE_RULES_VERSION_PATH).publishedAt,
  };
}

function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, resolve);
  });
}

/** Builds the three sites and serves one of them under the base path of the app. */
export async function startSilentUpdateSite(
  clientRoot: string,
  workerIndex: number,
): Promise<SilentUpdateSite> {
  const buildA = await buildSite(clientRoot);
  const sites: Record<SiteBuild, BuiltSite> = {
    [SiteBuild.A]: buildA,
    [SiteBuild.SILENT]: await buildSite(clientRoot, buildA.appRevision),
    [SiteBuild.APP_CHANGE]: await buildSite(clientRoot, ANOTHER_APP_REVISION),
  };
  let served: SiteBuild = SiteBuild.A;
  let newerZoneRules: ReturnType<typeof buildNewerReleaseFiles> | undefined;
  const answerWithNewerZoneRules = (pathname: string) => {
    if (newerZoneRules === undefined) return undefined;
    if (pathname === `${APP_BASE_PATH}${ZONE_RULES_VERSION_PATH}`) {
      return newerZoneRules.versionFileBody;
    }
    return pathname.endsWith(`/${newerZoneRules.release}.json`)
      ? newerZoneRules.releaseFileBody
      : undefined;
  };
  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");
    const zoneRulesBody = answerWithNewerZoneRules(pathname);
    if (zoneRulesBody !== undefined) {
      response.writeHead(HTTP_OK, {
        "Content-Type": CONTENT_TYPES[".json"] as string,
        "Cache-Control": "no-cache",
      });
      response.end(zoneRulesBody);
      return;
    }
    const relativePath = pathname.startsWith(APP_BASE_PATH)
      ? pathname.slice(APP_BASE_PATH.length)
      : undefined;
    const file =
      relativePath === undefined
        ? undefined
        : join(
            sites[served].directory,
            normalize(relativePath === "" ? INDEX_FILE : relativePath),
          );
    if (file === undefined || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(HTTP_NOT_FOUND).end();
      return;
    }
    response.writeHead(HTTP_OK, {
      "Content-Type": CONTENT_TYPES[extname(file)] ?? DEFAULT_CONTENT_TYPE,
      "Cache-Control": "no-cache",
    });
    createReadStream(file).pipe(response);
  });
  const port = SILENT_UPDATE_E2E_PORT + workerIndex;
  await listen(server, port);
  return {
    appUrl: `http://localhost:${port}${APP_BASE_PATH}`,
    serve: (build) => {
      served = build;
    },
    publishNewerZoneRules: () => {
      newerZoneRules = buildNewerReleaseFiles();
    },
    describe: (build) => sites[build],
    stop: async () => {
      server.close();
      await Promise.all(
        Object.values(sites).map((site) =>
          rm(site.directory, { recursive: true, force: true }),
        ),
      );
    },
  };
}
