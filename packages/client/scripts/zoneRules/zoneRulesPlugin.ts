/**
 * Vite plugin serving the zone rules release: `virtual:zone-rules-url` (the
 * emitted asset of a build, a dev middleware path when serving),
 * `virtual:zone-rules` (the parsed document, test mode only) and the preload
 * link of the asset in `index.html`.
 * A build also emits the served files of the update check.
 * Implements FR2, NFR-P2 of add-zone-rules-from-iana (design D2),
 * FR2 of add-remote-zone-rules-updates (design D7).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import { addZoneRulesPreload } from "./addZoneRulesPreload.ts";
import { buildServedZoneRulesFiles } from "./servedZoneRulesFiles.ts";

const URL_MODULE_ID = "virtual:zone-rules-url";
const RULES_MODULE_ID = "virtual:zone-rules";
const RESOLVED_ID_PREFIX = "\0";
const TEST_MODE = "test";
const ASSET_NAME = "zone-rules.json";
const JSON_CONTENT_TYPE = "application/json";
const CONTENT_TYPE_HEADER = "Content-Type";

type BundleOutput = { type: string; fileName: string; names?: string[] };

export type ZoneRulesPluginOptions = {
  /** The build instant, named by the version file as `publishedAt`. */
  deployInstant: string;
};

export function zoneRulesPlugin({
  deployInstant,
}: ZoneRulesPluginOptions): Plugin {
  let isBuild = false;
  let isTestMode = false;
  let base = "/";
  let releaseFilePath = ZONE_RULES_RELEASE_FILE;
  const readReleaseText = () => readFileSync(releaseFilePath, "utf8");
  const devPath = () => `${base}${ASSET_NAME}`;
  return {
    name: "time-zones-zone-rules",
    configResolved(config) {
      isBuild = config.command === "build";
      isTestMode = config.mode === TEST_MODE;
      base = config.base;
      releaseFilePath = resolve(config.root, ZONE_RULES_RELEASE_FILE);
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== devPath()) return next();
        response.setHeader(CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE);
        response.end(readReleaseText());
      });
    },
    resolveId(source) {
      const isServed =
        source === URL_MODULE_ID || (source === RULES_MODULE_ID && isTestMode);
      return isServed ? `${RESOLVED_ID_PREFIX}${source}` : undefined;
    },
    load(resolvedId) {
      if (resolvedId === `${RESOLVED_ID_PREFIX}${RULES_MODULE_ID}`) {
        return `export default ${readReleaseText().trim()};`;
      }
      if (resolvedId !== `${RESOLVED_ID_PREFIX}${URL_MODULE_ID}`) {
        return undefined;
      }
      if (!isBuild) return `export default ${JSON.stringify(devPath())};`;
      const referenceId = this.emitFile({
        type: "asset",
        name: ASSET_NAME,
        source: readReleaseText(),
      });
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
    },
    generateBundle() {
      if (!isBuild || isTestMode) return;
      for (const file of buildServedZoneRulesFiles(
        readReleaseText(),
        deployInstant,
      )) {
        this.emitFile({ type: "asset", ...file });
      }
    },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        if (!isBuild) return addZoneRulesPreload(html, devPath());
        const asset = Object.values(context.bundle ?? {}).find(
          (output: BundleOutput) => output.names?.includes(ASSET_NAME),
        );
        return asset
          ? addZoneRulesPreload(html, `${base}${asset.fileName}`)
          : html;
      },
    },
  };
}
